# Design System Strategy: The Industrial Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Precision Atelier"**

This design system is a marriage of mechanical precision and high-end editorial sophistication. It moves away from the "generic SaaS" look by embracing the weight of industrial textures and the clarity of Swiss-inspired typography. We treat the interface not as a digital screen, but as a physical space composed of layered premium materials—sand-blasted metals, charcoal matte finishes, and vibrant technical accents.

To achieve this, we break the "template" look through:
*   **Intentional Asymmetry:** Using abstract geometric shapes to guide the eye, rather than rigid centered layouts.
*   **Massive Contrast:** Utilizing Charcoal and Vibrant Yellow to create moments of high-impact visual hierarchy.
*   **Structural Depth:** Replacing traditional lines with tonal shifts to create a "nested" architecture.

---

## 2. Colors & Surface Philosophy

The palette is rooted in a sophisticated earth-industrial mix. The interaction between **Sand (#C7B299)** and **Charcoal (#1E1E1E)** provides a rugged yet luxurious foundation.

### Palette Highlights
*   **Primary (`#5F5E5E`):** The engine room color. Used for structural weight.
*   **Secondary/Accent (`#F2D06B` / `secondary`):** "Vibrant Yellow." Use this sparingly for high-priority actions and brand moments.
*   **Tertiary (`#C7B299` / `tertiary_container`):** "Sand." This acts as our primary warmth, used for large-scale background shifts.
*   **Neutral/Surface (`#F9F9F9`):** Our canvas.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. In this system, boundaries are defined strictly by background color shifts. A `surface-container-low` section sitting on a `surface` background is the only way to define a new area. This creates a more seamless, high-end feel.

### Signature Textures & Glass
To prevent a "flat" appearance, apply a subtle linear gradient to main CTAs (transitioning from `secondary` to `secondary_fixed_dim`). For floating elements like navigation bars or overlays, use **Glassmorphism**:
*   **Backdrop Blur:** 20px - 30px.
*   **Fill:** `surface` at 70% opacity.
*   **Effect:** This allows the "Sand" or "Charcoal" geometry beneath to bleed through, making the UI feel integrated and premium.

---

## 3. Typography: Bold Authority

We use **Plus Jakarta Sans** exclusively. It is a modern, geometric sans-serif that balances mechanical precision with approachable curves.

*   **Display Scale (`display-lg` to `display-sm`):** Set at **Bold (700)** weight. Use these for editorial moments where text acts as a graphic element. Tighten letter spacing by -2% for a "locked-in" feel.
*   **Headline & Title:** Use for page headers and card titles. These should always be high-contrast (e.g., `on_surface` or `on_tertiary_container`).
*   **Body (`body-lg` to `body-sm`):** Set at **Medium (500)** weight. Avoid "Regular" (400) weights to maintain the system's bold, professional presence.
*   **Labels:** Reserved for technical metadata (e.g., "Mechanic ID"). Use `label-md` in all-caps with increased letter spacing (+5%) to mimic industrial stamping.

---

## 4. Elevation & Depth

Hierarchy is achieved through **Tonal Layering** rather than drop shadows.

### The Layering Principle
Think of the UI as stacked sheets of fine paper.
1.  **Base:** `surface` (#F9F9F9)
2.  **Sectioning:** `surface-container-low` or `tertiary_container` (Sand)
3.  **Interaction Cards:** `surface-container-lowest` (pure white) placed atop a low-container to create a soft, natural lift.

### Shadows & Borders
*   **Ambient Shadows:** If an element must float (e.g., a bottom sheet), use a shadow with a blur of 40px and an opacity of 4%-6%. The shadow color should be a tint of the background, never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline_variant` token at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Buttons
*   **Primary:** Background: `secondary` (Vibrant Yellow) | Text: `on_secondary_fixed` | Roundness: `md`.
*   **Secondary:** Background: `primary` (Charcoal) | Text: `on_primary` | Roundness: `md`.
*   **Tertiary:** No background. Text: `primary`. Underline only on hover.

### Cards & Lists
*   **The Grid:** Use `spacing-6` (1.5rem) between cards.
*   **Separation:** **Forbid the use of divider lines.** Separate list items using vertical white space (`spacing-4`) or by alternating very subtle background tints (`surface` to `surface_container_low`).
*   **Abstract Geometry:** Hero cards should feature the system's signature "Curved Abstract Shapes" in the background using `tertiary` and `secondary` tints to create energy.

### Input Fields
*   **Style:** Minimalist. No border. Use `surface_container_high` as the fill. 
*   **Active State:** Change fill to `surface_container_highest` and add a 2px "Vibrant Yellow" accent bar at the bottom or side, rather than an all-around stroke.

### Specialized Component: The "Precision Badge"
A chip-like element for IDs or status. Uses `primary_fixed` background with `on_primary_fixed` text, using the `label-sm` typography spec for a technical, high-end feel.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts where text is balanced by large, rounded abstract shapes.
*   **Do** use the `xl` (1.5rem) roundness for large containers to emphasize the "modern mobile" feel.
*   **Do** prioritize "negative space" (whitespace). If the design feels crowded, increase the spacing scale by one increment.

### Don't
*   **Don't** use 1px dividers. If you feel the need for a line, use a background color change instead.
*   **Don't** use standard "Material Blue" or "Success Green" unless strictly necessary for system errors. Use our curated `error` tokens for alerts.
*   **Don't** center-align everything. The "Industrial Editorial" look thrives on left-aligned, structured blocks of content balanced by organic shapes.