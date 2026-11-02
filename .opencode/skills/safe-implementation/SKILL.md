---
name: safe-implementation
description: A repeatable method for implementing small, reviewable UTILORA changes with regression tests.
---
# Safe implementation

1. Inspect the current branch, status, relevant files, dependencies, and tests.
2. Reproduce the issue before changing code. Record the exact expected behavior.
3. Define file scope and acceptance criteria. Avoid unrelated refactors.
4. Prefer existing components, helpers, and design tokens.
5. Preserve localization, RTL, accessibility, privacy, and browser compatibility.
6. Add a regression test for each behavior change where practical.
7. Run the narrowest relevant test, then lint and build when possible.
8. Inspect the final diff for accidental files, generated artifacts, credentials, and scope creep.
9. Report exactly what was tested and what remains unverified.
