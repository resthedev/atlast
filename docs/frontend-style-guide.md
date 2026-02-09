# Atlast Frontend Design Style Guide

Last updated: 2026-02-09
Scope: All frontend UI, UX, and visual polish work in this repository.

This guide defines a shared design language for Atlast that is detailed enough to keep work coherent, while leaving room for experimentation and evolution.

Base inspiration: Anthropic Claude Code Frontend Design skill
Reference: https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md

## 1) Design North Star

Atlast should feel like **cartographic luxury**:
- Calm, premium, and atmospheric.
- Explorer-centric, not dashboard-generic.
- Expressive and memorable, not template-like.

The product should feel like a digital travel artifact: modern interaction quality with subtle old-world elegance.

## 2) Guiding Principles

These are strong defaults, not hard constraints.

1. Commit to a point of view
- Every feature should choose a clear mood and execute it intentionally.
- Avoid neutral "average SaaS" styling.

2. Distinctive typography over generic defaults
- Keep a characterful display voice plus a clean UI voice.
- Avoid generic type choices that flatten personality.

3. Dominant palette + selective accent
- Use a clear base atmosphere and reserve accent color for emphasis.
- Favor contrast in role and hierarchy, not rainbow variety.

4. Atmosphere, not flatness
- Backgrounds should create depth through gradients, texture, glow, or layered transparencies.
- Flat single-color canvases are acceptable only when intentional.

5. Motion as choreography
- Use a few high-impact motion moments, not constant animation noise.
- Prefer staged reveals and meaningful state transitions.

6. Spatial composition with intent
- Balance negative space with dense data moments.
- Use overlap, offset, and asymmetry where it helps storytelling and orientation.

7. Context-specific details matter
- Design details should feel tied to travel and mapping, not borrowed from generic UI kits.

## 3) Visual DNA for Atlast

Current visual signature:
- Deep ocean base.
- Warm metallic accent.
- Glassmorphism overlays.
- Serif-led brand moments with clean supporting text.
- Map-first canvas with floating utility layers.

Keep this DNA recognizable while allowing extensions (new surfaces, new interaction modes, seasonal palettes, richer map layers).

## 4) Token System and Theming

## 4.1 Current core tokens

Use and extend the existing CSS variables in `/src/index.css`:
- `--color-ocean`
- `--color-land`
- `--color-land-hover`
- `--color-border`
- `--color-text-primary`
- `--color-text-secondary`
- `--color-accent`
- `--color-accent-glow`
- `--color-glass-bg`
- `--color-glass-border`
- `--font-display`
- `--font-ui`

## 4.2 Token extension policy

- Prefer adding semantic tokens (`--color-surface-elevated`, `--color-success-soft`) over hardcoded hex values.
- Add a token when a value is reused or clearly represents a role.
- Keep aliasing shallow: semantic token -> base token is enough.
- Avoid adding many near-identical tokens unless there is a clear UI role difference.

## 4.3 Accent discipline

- Accent color should signal importance, interaction, and delight.
- Do not use accent for large body copy blocks.
- Keep "always-on accent" usage low so highlights still feel special.

## 5) Typography

## 5.1 Type roles

- Display role: expressive headings, brand marks, standout numeric moments.
- UI role: controls, labels, body copy, data tables.

## 5.2 Hierarchy guidance

- Display text should be sparse and purposeful.
- UI text should carry most reading load and remain highly legible.
- Numeric-heavy UI should use tabular figures when comparison matters.

## 5.3 Evolution guardrails

- New font pairings are allowed if they preserve the premium-explorer tone.
- Avoid converging to overused, generic sans stacks.
- Any major type change should be tested on dense and sparse screens before adopting globally.

## 6) Layout and Composition

## 6.1 Canvas model

- The map is the primary stage.
- Utility UI should feel layered above it, not competing with it.
- Overlays should preserve map readability.

## 6.2 Spacing rhythm

- Use consistent spacing steps, but allow occasional rule-breaking for emphasis.
- Favor clean edge alignment for utility panels.
- Keep enough breathing room around interactive clusters.

## 6.3 Safe-area and touch context

- Respect safe-area insets for top and side anchored elements.
- Keep touch targets comfortably sized for mobile interactions.

## 7) Components and Surfaces

## 7.1 Surface language

- Prefer translucent or atmospheric surfaces for floating UI.
- Use borders and shadows to clarify elevation layers.
- Keep blur and glow tasteful; avoid over-frosting every element.
- Use shared glass utilities for consistency:
  - `.glass`: primary floating panels/controls with medium-strong blur.
  - `.glass-soft`: compact chips/badges with softer blur.

## 7.2 Reusable component traits

- Controls should feel tactile with subtle hover/press response.
- Dense informational blocks should use consistent row rhythm and alignment.
- Interactive map states should prioritize instant feedback.

## 7.3 Inline styles vs shared styles

- Keep one-off inline styles for truly unique cases only.
- Promote repeated visual patterns into shared classes/tokens.
- When a visual pattern appears in 2+ places, consider extraction.

## 8) Motion and Interaction

## 8.1 Motion philosophy

- Motion should improve clarity, focus, or emotional quality.
- Prefer one coordinated entrance sequence over many unrelated animations.

## 8.2 Recommended timing ranges

- Micro interaction: 120-220ms.
- Standard transition: 220-420ms.
- Hero/entrance moments: 420-900ms with intentional staging.

## 8.3 Easing

- Favor expressive but controlled easings (for example cubic-bezier curves with smooth deceleration).
- Keep easing choices consistent across related interactions.

## 8.4 Reduced motion

- Preserve meaning when motion is reduced.
- Ensure reduced-motion users still receive clear state changes.

## 9) Color, Contrast, and Accessibility

- Preserve strong readability for body text and critical controls.
- Accent-glow effects must not replace actual contrast.
- Visible focus states are required for keyboard navigation.
- Interactive states should not rely on color alone.

## 10) Content Tone in UI

- Keep copy concise, calm, and purposeful.
- Favor language that supports exploration and progress.
- Avoid overly playful copy in utilitarian surfaces (leaderboards, stats, auth actions).

## 11) Implementation Pattern for Agents

For any frontend change, coding agents should follow this lightweight sequence:

1. Set intent
- Write a short note in the task/PR describing the intended aesthetic direction for this change.

2. Reuse existing language first
- Start from current tokens, type roles, and surface styles.

3. Add novelty intentionally
- Introduce at least one detail that feels crafted for Atlast (layout, motion, texture, visual motif), not generic.

4. Validate quickly
- Check desktop and mobile.
- Check reduced motion.
- Check legibility and contrast in realistic data states.

5. Leave the system better
- If a new pattern is reusable, extract it and document it.

6. Sync documentation with design-system changes
- If the task modifies the frontend design system (tokens, shared patterns, visual rules, or component conventions), update this file in the same task.

## 12) Flexibility and Evolution Rules

This system is intentionally non-rigid:
- New visual directions are encouraged when they still feel like Atlast.
- Local exceptions are valid when they are purposeful and documented.
- Periodically refresh components so the interface does not become static.

Use this guide as a shared compass, not a strict template.

## 13) Anti-Patterns to Avoid

- Generic "AI-looking" UI that could belong to any product.
- Overuse of default font stacks and unopinionated spacing.
- Excessive ornament on every component.
- Motion spam that distracts from map interaction.
- Hardcoded color values spread through many components.

## 14) Lightweight Frontend PR Checklist

- Does the change feel consistent with Atlast's cartographic-luxury tone?
- Is there at least one intentional detail that makes the UI memorable?
- Are tokens and reusable styles used where appropriate?
- Is readability strong on both desktop and mobile?
- Are motion and reduced-motion behaviors both acceptable?
- If this introduces a new pattern, was it extracted or documented?
