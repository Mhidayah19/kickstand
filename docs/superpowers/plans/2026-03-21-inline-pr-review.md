# Inline PR Design Review Suggestions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the design-principles-agent workflow to post inline PR review comments with "Apply suggestion" buttons instead of a single flat comment.

**Architecture:** Add a JSON output schema file to enforce structured Codex output, update the review prompt to emit only JSON, and replace the single `createComment` step with a `pulls.createReview` call that posts per-violation inline comments with `suggestion` code fences.

**Tech Stack:** GitHub Actions, `openai/codex-action@v1`, `actions/github-script@v7`, GitHub REST API (`pulls.createReview`, `pulls.listReviews`, `pulls.dismissReview`)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `.github/schemas/design-review-output.json` | Create | JSON schema enforcing structure of Codex output |
| `.github/prompts/design-principles-review.md` | Modify | Replace markdown output format with JSON output instructions |
| `.github/workflows/design-principles-agent.yml` | Modify | Add `output-schema-file`, replace posting step with inline review logic |

---

### Task 1: Create the JSON output schema

**Files:**
- Create: `.github/schemas/design-review-output.json`

- [ ] **Step 1: Create the schema file**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["violations", "summary"],
  "additionalProperties": false,
  "properties": {
    "violations": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["path", "line", "principle", "issue", "suggestion"],
        "additionalProperties": false,
        "properties": {
          "path": {
            "type": "string",
            "description": "File path relative to repo root (e.g. apps/api/src/bikes/bikes.service.ts)"
          },
          "line": {
            "type": "integer",
            "minimum": 1,
            "description": "End line number in the current file. Must be a line within the PR diff."
          },
          "start_line": {
            "type": "integer",
            "minimum": 1,
            "description": "Start line for multi-line violations. Omit for single-line violations."
          },
          "principle": {
            "type": "string",
            "enum": ["SRP", "OCP", "LSP", "ISP", "DIP", "DRY", "KISS", "SoC", "Law of Demeter", "CQS", "Codebase Pattern"]
          },
          "issue": {
            "type": "string",
            "description": "Description of the violation"
          },
          "suggestion": {
            "type": "string",
            "description": "Exact replacement code for the flagged line(s)"
          }
        }
      }
    },
    "summary": {
      "type": "string",
      "description": "Human-readable summary of all findings"
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add .github/schemas/design-review-output.json
git commit -m "feat: add JSON output schema for design principles review"
```

---

### Task 2: Update the review prompt to output JSON

**Files:**
- Modify: `.github/prompts/design-principles-review.md`

The current prompt asks for markdown-formatted output. It needs to instruct Codex to emit raw JSON only, matching the schema.

- [ ] **Step 1: Replace the prompt file contents**

Replace `.github/prompts/design-principles-review.md` with:

```markdown
You are a design principles reviewer for the Kickstand codebase.

Your job is to review the pull request diff and identify design principle violations
in the changed code. Do NOT modify any files — analysis only.

## How to Review

1. Run `git diff origin/<base-branch>...HEAD` to see what changed in this PR
2. For each changed file, evaluate the **changed lines only** against the design principles below
3. Output your findings as raw JSON — no markdown, no explanation, no code fences

## Design Principles to Evaluate Against

### SOLID Principles
- **SRP**: Each class/module should have one reason to change
- **OCP**: Open for extension, closed for modification
- **LSP**: Subtypes must be substitutable for their base types
- **ISP**: Don't force clients to depend on methods they don't use
- **DIP**: Depend on abstractions, not concretions

### General Principles
- **DRY**: Eliminate code duplication
- **KISS**: Favor straightforward solutions
- **SoC**: Separate distinct responsibilities into distinct modules
- **Law of Demeter**: Minimize knowledge between units
- **Command-Query Separation**: Separate state-changing methods from queries

### Codebase-Specific Patterns
- All database access goes through Drizzle via the `DRIZZLE` injection token
- Controllers use `@CurrentUser()` decorator for authenticated user context
- Notification jobs extend a cron pattern with dedup via `notificationLogs`
- DTOs use `class-validator` decorators for input validation
- Controllers should be thin (delegation only), services for business logic

## Output Format

Output ONLY a raw JSON object. No markdown. No explanation. No code fences. The JSON must match this structure exactly:

```json
{
  "violations": [
    {
      "path": "apps/api/src/bikes/bikes.service.ts",
      "line": 42,
      "principle": "SRP",
      "issue": "Service method handles both validation and persistence",
      "suggestion": "extractValidation(dto);\nawait this.save(dto);"
    }
  ],
  "summary": "Found 1 design principle violation."
}
```

Rules for each field:
- `path`: relative to repo root (e.g. `apps/api/src/bikes/bikes.service.ts`)
- `line`: the **end** line number of the violation in the current file. Must be a line visible in the PR diff — do not reference unchanged lines.
- `start_line`: include only for multi-line violations (the first line of the range). Omit entirely for single-line violations.
- `principle`: must be one of: SRP, OCP, LSP, ISP, DIP, DRY, KISS, SoC, Law of Demeter, CQS, Codebase Pattern
- `suggestion`: the exact replacement code for the flagged line(s) — this will render as a GitHub "Apply suggestion" button

## Rules
1. Only flag genuine principle violations — no cosmetic or style nitpicks
2. Only report violations on lines that appear in the PR diff — never flag unchanged lines
3. If no violations are found, output: `{"violations": [], "summary": "No design principle violations found in this PR."}`
4. Keep issue descriptions actionable and concise
```

- [ ] **Step 2: Commit**

```bash
git add .github/prompts/design-principles-review.md
git commit -m "feat: update review prompt to output structured JSON"
```

---

### Task 3: Update the workflow

**Files:**
- Modify: `.github/workflows/design-principles-agent.yml`

Two changes: (1) add `output-schema-file` and `output-file` to the Codex step, (2) replace the `Post review feedback` step with inline review posting logic.

- [ ] **Step 1: Update the workflow file**

Replace `.github/workflows/design-principles-agent.yml` with:

```yaml
name: Design Principles Review

on:
  pull_request:
    types: [opened, synchronize, reopened]
    paths:
      - 'apps/api/**'
      - 'apps/mobile/**'

jobs:
  design-review:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v5
        with:
          ref: refs/pull/${{ github.event.pull_request.number }}/merge

      - name: Pre-fetch base and head refs
        run: |
          git fetch --no-tags origin \
            ${{ github.event.pull_request.base.ref }} \
            +refs/pull/${{ github.event.pull_request.number }}/head

      - name: Run Codex Review
        id: codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt-file: .github/prompts/design-principles-review.md
          output-schema-file: .github/schemas/design-review-output.json
          output-file: /tmp/codex-review-output.json
          model: gpt-5.4-mini
          safety-strategy: drop-sudo
          sandbox: read-only

      - name: Post inline review
        if: always()
        uses: actions/github-script@v7
        with:
          github-token: ${{ github.token }}
          script: |
            const fs = require('fs');
            const owner = context.repo.owner;
            const repo = context.repo.repo;
            const pull_number = context.payload.pull_request.number;
            const commit_id = context.payload.pull_request.head.sha;

            // Guard: Codex step may have failed without writing an output file — skip silently
            if (!fs.existsSync('/tmp/codex-review-output.json')) {
              console.warn('No Codex output file found — Codex step may have failed. Skipping review post.');
              return;
            }

            // Read and parse Codex output
            let parsed;
            try {
              const raw = fs.readFileSync('/tmp/codex-review-output.json', 'utf8');
              try {
                parsed = JSON.parse(raw);
              } catch {
                // Try extracting JSON from markdown fences
                const match = raw.match(/```(?:json)?\n([\s\S]*?)\n```/);
                if (match) {
                  parsed = JSON.parse(match[1]);
                } else {
                  throw new Error('Could not parse Codex output as JSON');
                }
              }
            } catch (err) {
              console.error('Parse error:', err.message);
              await github.rest.pulls.createReview({
                owner, repo, pull_number, commit_id,
                event: 'COMMENT',
                body: '⚠️ Design review could not parse results. Check workflow logs.',
              });
              return;
            }

            const { violations, summary } = parsed;

            // Dismiss previous CHANGES_REQUESTED bot reviews to avoid stale feedback
            const existingReviews = await github.rest.pulls.listReviews({ owner, repo, pull_number });
            for (const review of existingReviews.data) {
              if (review.user.login === 'github-actions[bot]' && review.state === 'CHANGES_REQUESTED') {
                await github.rest.pulls.dismissReview({
                  owner, repo, pull_number,
                  review_id: review.id,
                  message: 'Superseded by new review',
                });
              }
            }

            // No violations — post clean review and exit
            if (!violations || violations.length === 0) {
              await github.rest.pulls.createReview({
                owner, repo, pull_number, commit_id,
                event: 'COMMENT',
                body: '✅ No design principle violations found in this PR.',
              });
              return;
            }

            // Build inline comments
            const comments = violations.map(v => {
              const comment = {
                path: v.path,
                line: v.line,
                side: 'RIGHT',
                body: `**${v.principle}**: ${v.issue}\n\n\`\`\`suggestion\n${v.suggestion}\n\`\`\``,
              };
              if (v.start_line) {
                comment.start_line = v.start_line;
                comment.start_side = 'RIGHT';
              }
              return comment;
            });

            // Attempt to post as a single formal review with inline comments.
            // On failure (e.g. lines outside the diff), fall back to plain-text summary.
            try {
              await github.rest.pulls.createReview({
                owner, repo, pull_number, commit_id,
                event: 'REQUEST_CHANGES',
                body: summary,
                comments,
              });
            } catch (err) {
              console.warn('Inline review failed, falling back to plain-text summary:', err.message);
              const fallback = violations.map(v =>
                `- **${v.principle}** \`${v.path}:${v.line}\`: ${v.issue}`
              ).join('\n');
              await github.rest.pulls.createReview({
                owner, repo, pull_number, commit_id,
                event: 'REQUEST_CHANGES',
                body: `${summary}\n\n**Could not post as inline comments (lines may be outside the diff):**\n\n${fallback}`,
              });
            }
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/design-principles-agent.yml
git commit -m "feat: post inline PR review comments with suggestion buttons"
```

---

### Task 4: Open a PR to test

There are no unit tests for GitHub Actions workflows. The proof of correctness is a live PR run.

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feat/inline-pr-review
```

- [ ] **Step 2: Open a PR against main**

```bash
gh pr create --title "feat: inline PR review suggestions" --body "$(cat <<'EOF'
Upgrades the design-principles-agent workflow to post inline review comments with Apply suggestion buttons instead of a single flat PR comment.

## Changes
- `.github/schemas/design-review-output.json` — new JSON schema enforcing structured Codex output
- `.github/prompts/design-principles-review.md` — updated to emit raw JSON only
- `.github/workflows/design-principles-agent.yml` — posts formal PR review with inline comments

## How to verify
1. Wait for the `Design Principles Review` check to run on this PR
2. Confirm it posts inline review comments (not a single comment) on changed lines
3. Confirm "Apply suggestion" button appears on each comment
4. If no violations: confirm a clean review comment appears
EOF
)"
```

- [ ] **Step 3: Monitor the workflow run**

```bash
gh run list --branch feat/inline-pr-review --limit 5
```

Watch for the `Design Principles Review` job. If it fails:

```bash
gh run view --log-failed
```

- [ ] **Step 4: Verify error paths**

**Stale review dismissal:** Push a second commit to this PR after the first review posts. On the next workflow run, confirm the old `CHANGES_REQUESTED` review is dismissed before the new one appears.

```bash
git commit --allow-empty -m "test: trigger re-review" && git push
```

**No-output silent skip:** Temporarily break the Codex step (e.g. set `model: invalid-model`) and confirm the posting step exits without posting a misleading error comment — the workflow failure should be visible only in the checks tab, not as a PR comment.

**Fallback plain text:** If any inline comment fails (line outside diff), confirm violations are still surfaced as plain text in the review body rather than silently dropped.
