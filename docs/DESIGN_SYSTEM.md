# UTILORA Design System & Visual Identity

## 1. Color Palette

UTILORA uses a dark minimal aesthetic tailored for high-frequency digital tools:

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Brand Background** | `#0A0B0E` | Main page background |
| **Brand Surface** | `#12141C` | Cards, panels, workspace frames |
| **Brand Surface Elevated** | `#171A26` | Toolbars, inputs, dropdown menus |
| **Brand Border Subtle** | `#232738` / `zinc-800` | Hairline dividers, card outlines |
| **Metallic Gold Accent** | `#F3C64F` / `#D4AF37` | Highlights, active tabs, brand emblem |
| **Typography Primary** | `#F4F4F5` / `zinc-100` | High-contrast headers and values |
| **Typography Muted** | `#A1A1AA` / `zinc-400` | Secondary copy, instructions, labels |
| **Typography Subtle** | `#71717A` / `zinc-500` | Meta dates, footnotes, constraints |

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
