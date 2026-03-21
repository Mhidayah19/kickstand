# Inline PR Design Review Suggestions

## Overview

Upgrade the existing Design Principles Review GitHub Action from posting a single PR comment to posting inline review comments with "Apply suggestion" buttons, using GitHub's Pull Request Review API.

## Approach

Use codex-action's `output-schema` to enforce structured JSON output, then parse and post as a formal PR review with inline comments.

## Architecture

The workflow remains a single GitHub Actions job with three steps:

1. **Checkout** — unchanged
2. **Codex Review** — existing codex-action step with `output-schema-file` added to enforce structured JSON output. Prompt updated to instruct Codex to output violations with file path, line number, principle, issue description, and code suggestion.
3. **Post Review** — replaces the current `createComment` step:
   - If violations exist: calls `pulls.createReview` with `event: "REQUEST_CHANGES"` and inline comments using `suggestion` code blocks
   - If no violations: posts a single comment ("No design principle violations found")

## Data Flow

### Output Schema

```json
{
  "type": "object",
  "properties": {
    "violations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "path": { "type": "string", "description": "File path relative to repo root" },
          "line": { "type": "integer", "minimum": 1, "description": "End line number in the current file (must be within the PR diff)" },
          "start_line": { "type": "integer", "minimum": 1, "description": "Start line number for multi-line violations (omit for single-line)" },
          "principle": { "type": "string", "enum": ["SRP", "OCP", "LSP", "ISP", "DIP", "DRY", "KISS", "SoC", "Law of Demeter", "CQS", "Codebase Pattern"], "description": "Violated principle name" },
          "issue": { "type": "string", "description": "Description of the violation" },
          "suggestion": { "type": "string", "description": "Exact replacement code for the flagged line(s)" }
        },
        "required": ["path", "line", "principle", "issue", "suggestion"],
        "additionalProperties": false
      }
    },
    "summary": { "type": "string", "description": "Human-readable summary of findings" }
  },
  "required": ["violations", "summary"]
}
```

### Review Posting Logic

```
// 1. Parse JSON — try raw first, then extract from markdown fences
let parsed;
try {
  parsed = JSON.parse(output);
} catch {
  const match = output.match(/```(?:json)?\n([\s\S]*?)\n```/);
  if (match) parsed = JSON.parse(match[1]);
  else throw new Error("Could not parse Codex output as JSON");
}

// 2. Dismiss previous bot review (avoid stale reviews on synchronize)
const existingReviews = await github.rest.pulls.listReviews({ owner, repo, pull_number });
for (const review of existingReviews.data) {
  if (review.user.login === 'github-actions[bot]' && review.state !== 'DISMISSED') {
    await github.rest.pulls.dismissReview({ owner, repo, pull_number, review_id: review.id,
      message: 'Superseded by new review' });
  }
}

// 3. Post review
violations.length > 0?
  → pulls.createReview({
      commit_id: context.payload.pull_request.head.sha,
      event: "REQUEST_CHANGES",
      body: summary,
      comments: violations.map(v => ({
        path: v.path,
        line: v.line,
        ...(v.start_line ? { start_line: v.start_line } : {}),
        side: "RIGHT",
        body: `**${v.principle}**: ${v.issue}\n\n\`\`\`suggestion\n${v.suggestion}\n\`\`\``
      }))
    })

violations.length === 0?
  → pulls.createReview({
      commit_id: context.payload.pull_request.head.sha,
      event: "COMMENT",
      body: "✅ No design principle violations found in this PR."
    })
```

The `suggestion` code fence renders as GitHub's clickable "Apply suggestion" button.

## Error Handling

1. **Invalid JSON / schema mismatch** — posting step first tries `JSON.parse(output)`, then falls back to extracting JSON from markdown code fences. If both fail, posts a single review comment: "Design review could not parse results. Check workflow logs."
2. **Invalid path or line** — GitHub API rejects comments pointing to lines not in the PR diff. Posting step catches per-comment errors and collects failed violations into the summary body as plain text fallback.
3. **Codex step fails entirely** — posting step checks for output file existence before proceeding. If no output, it skips silently (workflow failure is visible in PR checks tab).

No retry logic.

## Prompt Changes

Update `.github/prompts/design-principles-review.md`:

- Remove the "Output Format" section (no more markdown format)
- Add instructions to output only raw JSON matching the schema — no markdown wrapping, no extra text
- Clarify that `path` must be relative to repo root, `line` must reference a line within the PR diff (not arbitrary unchanged lines), and `suggestion` must contain the exact replacement code
- Instruct to only report violations on lines that appear in the PR diff
- For multi-line violations, include `start_line` (first line) and `line` (last line)
- Keep all review principles and rules as-is

## Files Changed

| File | Change |
|------|--------|
| `.github/workflows/design-principles-agent.yml` | Add `output-schema-file`, replace comment step with review posting step |
| `.github/prompts/design-principles-review.md` | Update output instructions for JSON |
| `.github/schemas/design-review-output.json` | New — JSON schema for violations output |
