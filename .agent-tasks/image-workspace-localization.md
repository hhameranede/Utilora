# Agent collaboration trial: localize the shared image workspace

## Mission

Use this task to prove that UTILORA's eight-agent OpenCode team can collaborate on a real, bounded product improvement—not merely return diagnostic sentences.

The current source provides concrete evidence of a user-facing gap:
- `src/components/templates/TemplateCImageWorkspace.tsx` contains many hard-coded English labels, instructions, button names, status messages, error text, and accessibility text.
- The application already exposes `useI18n()` and the eight supported locales `en, ar, fr, es, pt, hi, zh, bn` through `src/i18n/index.tsx`.
- `ToolPage` localizes the surrounding page, but the shared workspace is still English-only. This affects the six image tools that use Template C.

## Required team process

1. The Project Lead must convene **all seven specialists**: Problem Analyst, Implementation Engineer, Fast Task Engineer, Visual Reviewer, Long-Horizon Engineer, QA Engineer, and Security Auditor. Ask for independent evidence, options, risks, and disagreement before selecting an implementation.
2. Do not force consensus. Record the strongest agreement, any dissent, and why the chosen direction is best.
3. Skills are optional. Each agent may choose useful skills or use none. Do not require skill calls or a fixed tool sequence.
4. The Project Lead coordinates; it must not implement code itself.
5. Use the specialist agents according to their roles. Reviewers remain read-only.

## Implementation objective

Localize the complete shared image-workspace experience for all eight supported locales using the existing i18n architecture. Keep the change focused on:
- `src/components/templates/TemplateCImageWorkspace.tsx`
- the eight existing JSON locale dictionaries under `src/i18n/locales/`
- a focused regression test and the smallest necessary test script/package wiring.

Include the visible empty state, file-selection instructions, file limits/formats, settings and field labels, quality/format controls, resize/crop/rotate labels, image preview alt text, metadata labels and notes, processing/download buttons, progress/status messages, and component-owned validation/error messages. Avoid leaving English-only user-facing copy in the shared workspace when the locale is not English.

Use the existing `useI18n()` / `t()` API; do not add a translation library or a second localization system. Preserve the existing image processing behavior and all current tool variants. Keep the interface calm and consistent with UTILORA's warm-white, stone-gray, and orange design.

Ensure Arabic text and layout work in RTL, labels remain accessible, keyboard operation and visible focus remain intact, and long translated strings wrap cleanly on narrow screens. Do not introduce green or purple accents, heavy glass effects, or unnecessary animation.

## Privacy and correctness invariants

- Keep image processing local to the browser. Do not add uploads, analytics, remote image APIs, or persistence of user files.
- Do not read secrets, environment files, private credentials, or browser profiles.
- Do not fabricate translations, image-processing capabilities, or test results.
- Do not change deployment, DNS, auth, billing, destructive data logic, or security policy.
- Do not commit, push, merge, or deploy. Leave an inspectable working-tree diff for the workflow artifact.

## Independent verification

- QA must inspect the actual implementation, add/adjust regression coverage for all eight locale dictionaries, and run the focused image tests plus relevant lint/build/browser checks where feasible. Do not approve based only on the implementer's summary.
- Security Auditor must independently verify that the change does not introduce file uploads, network transmission, unsafe rendering, or secret exposure.
- Visual Reviewer must use the locally running preview at `http://127.0.0.1:3000` to inspect `/en/tools/image-converter` and `/ar/tools/image-converter`, including desktop and narrow mobile layouts. Capture or inspect real rendered states; do not infer visual results from source alone.
- Project Lead must report exact changed files, commands and exit results, what each specialist contributed, any disagreements, remaining risks, and whether the implementation is ready for human review.

A successful task is a real, reviewable code change with evidence—not merely a plan or a polished report.