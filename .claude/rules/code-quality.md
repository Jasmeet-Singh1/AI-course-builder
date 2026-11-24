# Code Quality

## Principles
- **Single responsibility.** Components render, `lib/` holds logic, `configs/AiModel.jsx` (or its server successor) owns prompts, and route handlers own HTTP concerns.
- **DRY, but reuse what exists first.** Use `CourseReader`, `components/ui/*`, `lib/courseStore`, `buildFallbackCourse` before writing new versions.
- **Handle every async path.** Each `fetch` or AI call has loading, success and error states visible in the UI. No silent `catch {}`.
- **No dead inputs.** If a form field is collected (e.g. `displayVideo`), it is either used or marked TODO in the spec.

## Naming
- Components: `PascalCase.jsx`. Route-private folders: `_components`, `_context`, `_shared`.
- Functions/vars: `camelCase`. Constants: `UPPER_SNAKE_CASE`.
- API routes follow Next conventions: `app/api/<resource>/route.js`.

## Quality Gates (before calling work done)
1. `npm run build` passes with no new warnings.
2. The manual flow works: sign in → create → generate → preview → save → dashboard → reopen.
3. Once tests exist: `npm test` passes, and new behaviour has a test. A bug fix gets a regression test.
4. No `console.log` left in committed code, except deliberate error logging.

## Refactoring (Two Hats)
Either change behaviour or restructure, never both in one commit.
