---
name: gemini-integration
description: Use when adding or changing a Gemini prompt, model setting, or AI-generated field in this app. Covers where AI code lives, the prompt → parse → validate → decide pattern, and what must change together.
---

# Gemini Integration

## Where it lives
- Model and prompt: `configs/AiModel.jsx` (`generateCourse_AI`, `buildFallbackCourse`).
- Caller: `GenerateCourseLayout` in `app/create-course/page.jsx`.
- Target state: the call moves to a server route (`app/api/generate/route.js`) using `GEMINI_API_KEY`, behind `auth()`.

## Pattern
1. Build the prompt with user input inside delimiters, e.g. `<topic>...</topic>`.
2. Call with `responseMimeType: "application/json"`.
3. Parse, then validate per `.claude/rules/ai-output.md`.
4. Retry once with the errors, then fall back with `fallback: true`.

## Change Together
Adding or renaming an output field means updating all of these in one change: the prompt schema, the validator, `buildFallbackCourse`, `CourseReader.jsx`, and `toSummary` in `lib/courseStore.js`.

## Check
Run `/eval-prompt` before and after the change.
