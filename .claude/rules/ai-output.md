---
paths: ["configs/**", "app/api/**", "lib/**", "app/create-course/**"]
---

# AI Output Rules

Loaded only when working on the prompt, API or generation flow.

## The Contract
Every model call follows **prompt → parse → validate → decide**:
1. **Prompt:** role, delimited user input, hard rules, explicit JSON schema. JSON mode is on (`responseMimeType: "application/json"`).
2. **Parse:** strip code fences, then `JSON.parse` inside `try`.
3. **Validate:** check against a schema, which must cover:
   - `courseName`, `description`: non-empty strings
   - `chapters`: array, length **equal to the requested count**
   - each chapter: `chapterName`, `about`, `duration`, all non-empty strings
4. **Decide:**
   - valid → use it
   - invalid → retry **once** with the validation errors appended
   - still invalid → `buildFallbackCourse()` with `fallback: true`, and the UI must show the amber notice

## Never
- Never show or save model output that skipped validation.
- Never drop the `fallback` flag or hide the fallback notice. The user must always know whether content came from the model.
- Never change the output schema without updating, in the same change: the prompt, the validator, `buildFallbackCourse`, `CourseReader`, and `toSummary` in `lib/courseStore.js`.

## Prompt Changes
Any prompt change is checked with `/eval-prompt` before merge. Record the before/after pass rate in `artifacts/evals/`.
