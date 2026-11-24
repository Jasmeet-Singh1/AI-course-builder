# Spec: Server-side course generation with validated AI output

**Date:** 2026-11-24 · **Size:** Medium · **Status:** Done

## Goal
Move the Gemini call off the browser so the API key is never shipped to users. Make sure every course shown or saved has passed a schema check, including the exact chapter count the user asked for.

## Context
- `configs/AiModel.jsx:3` reads `NEXT_PUBLIC_GEMINI_API_KEY`, and `app/create-course/page.jsx:80` calls Gemini from a client component, so the key ends up in the JS bundle (security.md, Critical).
- `app/create-course/page.jsx:81-86` only runs `JSON.parse`. A course with the wrong chapter count or empty fields is accepted.
- The prompt ignores the optional `description` field that `TopicDescription.jsx` collects.
- `POST /api/courses` (`app/api/courses/route.js:23`) only checks that `chapters` is a non-empty array.
- There's no cap on `chapters` and no rate limit, so cost is unbounded.

## In Scope
- `lib/courseSchema.js` (new): `normalizeInput(input)` and `validateCourse(course, expectedChapters?)`.
- `lib/fallbackCourse.js` (new): `buildFallbackCourse`, moved unchanged from `configs/AiModel.jsx`.
- `lib/courseGenerator.js` (new, server-only): `buildPrompt`, `generateCourse`, with a delimited prompt, one retry carrying the validation errors, then the fallback.
- `app/api/generate/route.js` (new): `POST`, Clerk `auth()`, input validation, simple per-user rate limit.
- `app/create-course/page.jsx`: call `/api/generate` instead of importing the model.
- `app/api/courses/route.js`: validate with `validateCourse` before saving.
- Delete `configs/AiModel.jsx`.
- Vitest unit tests for the three `lib/` modules, plus a `test` script.
- Update docs that reference `configs/AiModel.jsx`.

## Out of Scope
- Renaming the env var in `.env.local` (the user does this; the code accepts both names in the meantime).
- Persistent or distributed rate limiting.
- The `displayVideo` feature, and moving storage to a DB.

## Design
- **Input limits:** `topic` 1–200 chars (required), `description` ≤ 1000, `category`/`level`/`duration` required, `chapters` an integer clamped to 1–20.
- **Output schema:**
  - `courseName` and `description`: non-empty strings.
  - `chapters`: an array whose length equals the requested count.
  - each chapter: non-empty `chapterName`, `about`, `duration`.
  - max 20 chapters when no count is given.
- **Flow:** prompt → parse → validate → on failure, retry once with the errors → on second failure, fallback with `fallback: true`. The response is `{ course, fallback, attempts }`.
- **Key:** `process.env.GEMINI_API_KEY`, with a temporary server-side fallback to `NEXT_PUBLIC_GEMINI_API_KEY`. Because no client code references it any more, it is no longer bundled.
- **Rate limit:** 5 generations per user per minute, in memory. Returns 429.

## Acceptance Tests
- [x] AT1: `npm test` passes. It covers valid course accepted, wrong chapter count rejected, empty field rejected, chapters clamped, fallback count matches.
- [x] AT2: `npm run build` passes.
- [x] AT3: `POST /api/generate` without sign-in → 401.
- [x] AT4: no client bundle in `.next/static` contains `GEMINI` or `generativelanguage`.
- [x] AT5: `POST /api/courses` without sign-in → 401. A malformed course is rejected by `validateCourse` (unit test).
- [x] AT6: `/eval-prompt` shows the candidate is at least as good as baseline on schema pass rate and chapter-count accuracy.
- [ ] AT7 (manual, the user does this): signed in, generate → preview → save → dashboard → reopen works.

## Security & Privacy
Removes the Critical key exposure. Adds auth and a rate limit to generation. User text is delimited in the prompt. No personal data goes to Gemini.

## Review Outcome (worker-reviewer, 2026-11-24)
Verdict: Ready after fixes. No Critical or High findings. All 3 Medium and 5 Low findings were fixed, and regression tests were added (23 tests total):
- The save route re-validates against the requested count and stores only known fields (`toCleanCourse`).
- `level`/`duration` are whitelisted, `category` is capped, and `displayVideo` is coerced to Yes/No.
- `<` is escaped in the prompt payload, only the outer fence is stripped, model calls time out after 45 s, the rate-limit map evicts old entries, and the stray `console.log` is removed.
Eval re-run after the fixes: `artifacts/evals/eval_2026-11-24_after-review.md` (8/8).

## Risks / Open Questions
- A client can still post `fallback: false` for a fallback outline, because the save route can't prove where a course came from. Fixing this fully means signing generation results on the server, or saving them server-side at generation time. Logged in `artifacts/decisions.md`.
- An in-memory rate limit resets on restart and isn't shared across instances. That's acceptable for the prototype.
