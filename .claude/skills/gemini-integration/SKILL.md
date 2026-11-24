---
name: gemini-integration
description: Use when adding or changing a Gemini prompt, model setting, or AI-generated field in this app. Covers where AI code lives, the prompt → parse → validate → decide pattern, and what must change together.
---

# Gemini Integration

## Where it lives
- Model, prompt, retry: `lib/courseGenerator.js` (`buildPrompt`, `generateCourse`). Server-only.
- Schema and input limits: `lib/courseSchema.js` (`normalizeInput`, `validateCourse`).
- Fallback: `lib/fallbackCourse.js` (`buildFallbackCourse`).
- HTTP entry: `app/api/generate/route.js` (auth, 400 on bad input, 429 rate limit). The client page only calls this route.
- Tests: `tests/courseGenerator.test.js` uses a fake `callModel`. Eval: `npm run eval -- <label>`.

## Pattern
1. Build the prompt with user input inside delimiters, e.g. `<topic>...</topic>`.
2. Call with `responseMimeType: "application/json"`.
3. Parse, then validate per `.claude/rules/ai-output.md`.
4. Retry once with the errors, then fall back with `fallback: true`.

## Change Together
Adding or renaming an output field means updating all of these in one change: the prompt schema, the validator, `buildFallbackCourse`, `CourseReader.jsx`, and `toSummary` in `lib/courseStore.js`.

## Check
Run `/eval-prompt` before and after the change.
