# UTILORA Design System & Visual Identity

## 1. Color Palette

UTILORA uses a light, minimal aesthetic tailored for high-frequency digital tools:

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Brand Background** | `#FAFAF9` | Main page background |
| **Brand Surface** | `#FFFFFF` | Cards, panels, workspace frames |
| **Brand Surface Elevated** | `#F5F5F4` | Toolbars, inputs, dropdown menus |
| **Brand Border** | `#E7E5E4` / `stone-200` | Hairline dividers and card outlines |
| **Orange Accent** | `#F97316` / `orange-500` | Primary actions, active states, brand emblem |
| **Typography Primary** | `#1C1917` / `stone-900` | High-contrast headings and values |
| **Typography Muted** | `#57534E` / `stone-600` | Secondary copy, instructions, labels |
| **Typography Subtle** | `#78716C` / `stone-500` | Meta dates, footnotes, constraints |

*Anti-Slop Ban: Neon greens, electric purples, candy gradients, and heavy glassmorphism are explicitly prohibited.*

---

## 2. Zero-Pill & Metadata Discipline

In compliance with the frontend design constitution:
- **No Static Pill Enclosures:** Category tags, timestamps, reading times, and status flags are NEVER rendered inside bordered pill capsules or colored badge envelopes.
- **Clean Inline Prose:** Metadata is separated by clean typographic dots (`·`) or slashes (`/`):
  ```tsx
  // ✅ Correct UTILORA Metadata Style:
  <div className="flex items-center gap-2 text-xs text-zinc-400">
    <span>Image Tools</span>
    <span aria-hidden="true" className="text-zinc-600">·</span>
    <span>4 min read</span>
    <span aria-hidden="true" className="text-zinc-600">·</span>
    <span>Updated Feb 2026</span>
  </div>
  ```
- **Interactive Buttons Allowed:** Segmented filter bars and mode switchers that trigger user actions remain standard accessible button elements.

---

## 3. Typography Stacks

- **Latin Font:** Plus Jakarta Sans / Inter / system-ui fallback.
- **Monospace Font:** JetBrains Mono for hex digests, code snippets, DNS records, and line gutters.
- **Arabic Font:** Noto Sans Arabic / Cairo with native `dir="rtl"` layout flow.
