# Design System Strategy: The Digital Concierge

## 1. Overview & Creative North Star
The Digital Concierge is more than a booking platform; it is a high-end editorial experience designed for the discerning traveler. While most car rental sites rely on generic grids and loud calls-to-action, this design system embraces **"Precision Luxury."** 

Our Creative North Star focuses on **Tonal Authority.** We break the "template" look by utilizing intentional white space (the 24-scale), overlapping high-quality automotive photography with sophisticated typography, and favoring depth over flat containment. The goal is to make the user feel as though they are browsing a premium lifestyle magazine, where the "order" button is a discrete, high-end service rather than a transactional utility.

---

## 2. Colors
Our palette is rooted in the "Wak Cars" heritage, using high-contrast tones to evoke both speed and stability.

*   **Primary (`#bd0015`) & Primary Container (`#e61e25`):** Used sparingly for high-intent actions and brand signatures.
*   **Neutral Foundation:** We rely on `surface` (`#fcf9f8`) and `surface-container-low` (`#f6f3f2`) to create a gallery-like backdrop.
*   **The "No-Line" Rule:** To maintain a premium feel, 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts. For example, a search widget should sit as a `surface-container-lowest` card upon a `surface-container-low` background.
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers. An inner card (`surface-container-highest`) nested within a sidebar (`surface-container-high`) provides a tactile, logical flow without visual clutter.
*   **The "Glass & Gradient" Rule:** Use Glassmorphism (semi-transparent `surface` with 20px backdrop-blur) for floating navigation bars and filter overlays. Apply a subtle gradient from `primary` to `primary_container` on main CTAs to add "soul" and depth.

---

## 3. Typography
We utilize a high-contrast scale to separate "Editorial Content" from "Utility Information."

*   **Display & Headlines (Plus Jakarta Sans):** This typeface offers a technological yet friendly geometric structure. Use `display-lg` (3.5rem) for hero statements to command attention. Wide tracking and bold weights convey the "Trustworthy" brand pillar.
*   **Titles & Body (Inter):** A workhorse for readability. `title-md` is used for car names, while `body-md` handles technical specifications.
*   **The Hierarchy Strategy:** Large display text should be paired with generous leading (1.5x) and a "less is more" copy approach. Labels (`label-md`) should be used in `secondary` (`#5f5e5e`) for metadata like "Fuel Type" or "Mileage" to keep the visual field clean.

---

## 4. Elevation & Depth
In this design system, depth is a functional tool, not a decoration.

*   **The Layering Principle:** Use the Tonal Scale (`surface-container-lowest` to `highest`) to stack elements. A white card on a light grey background creates a "Soft Lift" that feels more modern than a heavy shadow.
*   **Ambient Shadows:** When an element must float (e.g., a booking modal), use a highly diffused shadow: `0 20px 40px rgba(28, 27, 27, 0.06)`. The shadow color is a tint of our `on-surface` color, ensuring it feels like natural light.
*   **The "Ghost Border" Fallback:** If a container requires definition against a similar background, use a `1px` border of `outline-variant` at **15% opacity**. This creates a "suggestion" of a boundary that disappears into the whitespace.
*   **Glassmorphism:** Navigation menus should use a `surface` tint with 70% opacity and a backdrop blur of `16px`. This integrates the UI with the high-quality car photography behind it.

---

## 5. Components

### Car Cards (The Signature Component)
*   **Structure:** No borders or divider lines. Use `surface-container-lowest` as the card base.
*   **Imagery:** Aspect ratio 16:9, slightly rounded (`md: 0.75rem`).
*   **Content:** Title in `headline-sm`, pricing in `primary`. Use vertical whitespace (`spacing-4`) to separate the image from the technical specs.

### Search & Filter Bars
*   **Style:** A horizontal "Floating Bar" using `surface-container-lowest` with an `ambient shadow`. 
*   **Inputs:** Forgo the boxy input look; use `title-sm` text with a subtle `secondary` label above it. Separate fields with a vertical `spacing-8` gap rather than a line.

### Buttons
*   **Primary:** `primary` background, `on-primary` text. `xl` roundedness (1.5rem) for a modern, approachable feel.
*   **Secondary:** `surface-container-high` background with `on-surface` text. No border.
*   **States:** On hover, primary buttons should shift to `primary_container` with a subtle increase in shadow spread.

### Booking Widgets
*   **Visuals:** Use "Glassmorphism" for the summary sidebar to keep the interface feeling "light" and technologically advanced.
*   **Lists:** Forbid divider lines. Use `spacing-3` between line items and a subtle background shift (`surface-container-low`) for alternating rows if necessary.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts where text overlaps 10% of a car image to create an editorial feel.
*   **Do** prioritize the `spacing-10` and `spacing-12` values for section margins to allow the brand to "breathe."
*   **Do** use `tertiary_fixed` (`#ffdf9e`) for "Premium" or "VIP" badges to add a touch of gold-standard prestige.

### Don't:
*   **Don't** use 100% black text. Always use `on-surface` (`#1c1b1b`) to maintain a softer, premium look.
*   **Don't** use sharp 90-degree corners. Everything must adhere to the `md` or `lg` roundedness scale to feel "Advanced."
*   **Don't** use standard "drop shadows" that look like dark smudges; ensure shadows are always low-opacity and highly diffused.