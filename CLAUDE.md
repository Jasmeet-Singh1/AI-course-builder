# AI Course Generator

A Next.js app where a signed-in user describes a course, Google Gemini returns a JSON course outline, and the user previews and saves it.

## Quick Reference

| Task | Command |
|---|---|
| Install | `npm install` |
| Dev server | `npm run dev` (http://localhost:3000) |
| Unit tests (Vitest) | `npm test` |
| Production build | `npm run build` |
| Prompt/model eval (calls Gemini) | `npm run eval -- <label>` → `artifacts/evals/` |
| Start built app | `npm start` |

Quality gate: `npm test` + `npm run build` + the manual flow (see `.claude/skills/land-the-plane`). No linter yet.

## Core Principles

1. **Understand first.** Read the files you will touch before editing them. Trace the data flow (form → Context → `/api/generate` → Gemini → validate → preview → `/api/courses` → `data/courses.json`).
2. **Never trust AI output.** Every model response is parsed, checked against a schema, and either accepted, retried, or shown as a labelled fallback. See `.claude/rules/ai-output.md`.
3. **Keep it safe.** API keys stay on the server. Personal data (email, userId) never leaves its owner's scope. See `.claude/rules/security.md`.
4. **Keep it simple.** Smallest change that solves the task. No new dependency without saying why.
5. **Prove it works.** Run `npm run build` and the manual flow before calling work done.
6. **Leave a trail.** Plans and decisions go in `./artifacts/`; scratch notes go in `./scratchpad/`.

Full details live in `.claude/rules/` and load automatically.

## Architecture Map

| Concern | File(s) |
|---|---|
| Auth gate | `middleware.js` (Clerk, protects `/dashboard(.*)`) |
| 3-step input form | `app/create-course/page.jsx`, `app/create-course/_components/*` |
| Shared draft state | `app/_context/UserInputContext.jsx`, `app/create-course/layout.jsx` |
| Generate API (auth, input limits, rate limit) | `app/api/generate/route.js` |
| Prompt + Gemini call + retry (server-only) | `lib/courseGenerator.js` |
| Input limits + output schema | `lib/courseSchema.js` |
| Labelled fallback outline | `lib/fallbackCourse.js` |
| Tests / eval | `tests/*.test.js`, `scripts/eval-prompt.mjs`, `artifacts/evals/` |
| Preview / reader UI | `app/_components/CourseReader.jsx`, `app/create-course/preview/page.jsx` |
| API | `app/api/courses/route.js` (GET list, POST save), `app/api/courses/[id]/route.js` |
| Storage | `lib/courseStore.js` → `data/courses.json` (gitignored) |
| Dashboard | `app/dashboard/*` |

## Workflow

Ceremony scales with the size of the change:

| Size | Example | Steps |
|---|---|---|
| Trivial | typo, copy change | Edit → build |
| Small | new form field, UI tweak | `/spec` (short) → implement → `/review` → `/land-the-plane` |
| Medium+ | move Gemini call server-side, new storage | `/spec` with acceptance tests → implement in steps → `/review` → `/land-the-plane` |

- Branching: short-lived branches off `master`, one concern per PR, never commit secrets.
- A spec is an artifact: `artifacts/spec_<feature>.md`, from `.claude/templates/spec.template.md`.
- Decisions that are hard to reverse get a short log entry in `artifacts/decisions.md`.

## Working Directories

| Dir | Committed | Holds |
|---|---|---|
| `./artifacts/` | yes | specs, decision log, eval results, weekly notes |
| `./scratchpad/` | no (gitignored) | throwaway notes, `corrections.log` |
| `./data/` | no (gitignored) | saved courses (contains user emails) |

## Commands (skills)

| Command | Role | What it does |
|---|---|---|
| `/spec <feature>` | Spec writer | Writes a task spec with acceptance tests an agent can build against |
| `/review` | Adversarial reviewer | Reviews the current change against the rules; read-only |
| `/land-the-plane` | Finish-line | Runs gates, manual flow check, updates notes, prepares commit |
| `/eval-prompt` | Evaluator | Runs a fixed set of inputs through the prompt and scores the outputs |

Library skill (auto-used): `gemini-integration`, which covers how to add or change a prompt safely.

## Subagents

| Agent | Model | Can edit? | Use for |
|---|---|---|---|
| `worker-explorer` | haiku | no | finding code, tracing flows |
| `worker-builder` | sonnet | yes | implementing one spec'd task |
| `worker-reviewer` | sonnet | no | reviewing a diff against the rules |

Workers never spawn workers. Give each one a spec path, not the whole conversation.
