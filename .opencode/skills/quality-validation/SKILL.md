---
name: quality-validation
description: Runs UTILORA's existing tests and validates generated routes, SEO output, and production build behavior.
---
# Quality validation

Use the project's package scripts instead of inventing new commands:
- `npm run lint`
- `npm run test:products`
- `npm run test:core`
- `npm run test:pdf`
- `npm run test:image`
- `npm run test:diagnostics`
- `npm run build`
- `npm run e2e`

Run the narrowest relevant checks first. For route or rendering changes, verify prerendered output and direct deep links. For tool changes, test success, invalid input, edge cases, and error recovery. Distinguish local checks, CI checks, preview checks, and production checks. Never report a test as passing unless the command completed successfully.
