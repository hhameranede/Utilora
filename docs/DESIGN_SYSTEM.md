# UTILORA Design System — V4

V4 is a full visual identity reset for the existing UTILORA product. It changes presentation, not the underlying tool contracts, processing engines, routes, SEO model, or supported locale set.

## 1. Brand direction

**Direction:** Clear, confident, calm, and product-led. UTILORA should feel like a cohesive digital workspace rather than a collection of unrelated utility pages.

| Token | Value | Use |
|---|---|---|
| Page background | `#F5F7FC` | Cool mist canvas |
| Surface | `#FFFFFF` | Cards, tool panels, menus |
| Soft surface | `#EEF2F9` | Inputs, subtle grouping |
| Border | `#E2E8F2` | Dividers and card edges |
| Primary ink | `#111A2E` | Headings and important values |
| Muted ink | `#5E6C84` | Body copy |
| Subtle ink | `#8290A7` | Helper copy and metadata |
| Primary | `#4658D8` | Main actions and active states |
| Primary strong | `#3444BD` | Hover and emphasis |
| Primary soft | `#EDF0FF` | Icon surfaces and selected backgrounds |
| Primary line | `#D9DFFF` | Accent borders |
| Secondary accent | `#0B8F91` | Small supporting signals only |

The old orange utility classes remain temporarily as compatibility hooks for the many shared workspaces. V4 maps those legacy classes to the Indigo palette in `src/design-v4.css`; they must not be treated as the brand colour in new components.

## 2. Typography

- Latin UI: Plus Jakarta Sans with system fallbacks.
- Arabic UI: Cairo / Noto Sans Arabic with native RTL direction.
- Code, identifiers and structured values: JetBrains Mono.
- Use a strong but compact heading scale. Body text should remain readable at 14–16px on desktop and 12–14px on narrow mobile layouts.

## 3. Layout and surfaces

- Use generous whitespace on desktop and compact, task-first spacing on mobile.
- Prefer clear rectangular surfaces with 12–22px corner radii; avoid turning every metadata label into a pill.
- Use one clear primary action per task, with a quieter secondary action.
- Keep the working tool visible and prominent. Marketing copy must never push a functional workspace far below the fold.
- Use restrained gradients for depth and hierarchy, not as decoration on every element.
- Keep navigation, cards, search, inputs, upload zones, and workspace panels visually related.

## 4. Interaction and motion

- Use short transitions for hover, focus, selection and menu state.
- Preserve visible keyboard focus and minimum touch targets.
- Respect `prefers-reduced-motion`; motion must never be required to understand a state.
- Hover-only affordances must have touch and keyboard equivalents.

## 5. Responsive behaviour

- Support 320px phones through wide desktop screens without page-level horizontal overflow.
- Stack complex workspaces at tablet and mobile breakpoints.
- Preserve Arabic reading order and correct inline start/end alignment.
- Keep the main search and popular tool shortcuts immediately discoverable on mobile.

## 6. Accessibility and contrast

- Keep semantic headings, labels, buttons, links, and landmark structure.
- Maintain readable contrast for body text, metadata, selected states and controls.
- Never rely on colour alone to communicate functional, preview-only, loading, success, or error states.
- Preserve accessible names, focus management and Escape behaviour in dialogs and navigation drawers.

## 7. Product integrity

The redesign does not change tool behaviour, upload handling, privacy boundaries, accepted formats, file limits, preview-only statuses, or SEO indexability. Do not add unsupported capability claims, usage metrics, testimonials, or performance guarantees. The Website & Domain tools continue to make the public-network requests described by their engine contracts.

## 8. Implementation

- Shared visual overrides: `src/design-v4.css`.
- Application entry imports the V4 layer after the existing base and motion styles.
- Homepage composition: `src/pages/HomePage.tsx`.
- Brand assets: `public/brand-mark.svg` and `public/pwa-icon.svg`.
- The registry, engines, templates, router, localization files, PWA runtime behaviour, and SEO generator remain independent of the visual layer.
