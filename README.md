# AI Course Builder

A Next.js app where a signed-in user describes a course, and Google Gemini returns a structured course outline. The server **validates the outline before anyone sees it**. The user then reads it chapter by chapter and saves it to their account.

The project is also set up for **agentic development** with Claude Code. Written rules, task specs, worker agents with limited permissions, guardrail hooks and an evaluation runner decide what AI-written code and AI-generated content are accepted.

## How it works

```
3-step form ──► POST /api/generate ──► Gemini (JSON mode) ──► validate ──┐
 (category,      auth · input limits     delimited prompt         │ fail: retry once
  topic, level,  · rate limit (5/min)                             │ with the errors
  chapters)                                                       ▼
                                                   still invalid → labelled fallback
                                                                  │
preview (CourseReader) ◄──────────────────────────────────────────┘
      │ Save
      ▼
POST /api/courses ── auth · validateCourse ──► lib/courseStore.js ──► data/courses.json
dashboard ── GET /api/courses (scoped to the signed-in user)
```

| Concern | File |
|---|---|
| Auth (Clerk) | `middleware.js`, plus `auth()` inside every API route |
| Form + shared state | `app/create-course/*`, `app/_context/UserInputContext.jsx` |
| Generation endpoint | `app/api/generate/route.js` |
| Prompt, Gemini call, retry (server-only) | `lib/courseGenerator.js` |
| Input limits + output schema | `lib/courseSchema.js` |
| Labelled fallback outline | `lib/fallbackCourse.js` |
| Save / list / read courses | `app/api/courses/*`, `lib/courseStore.js` |
| Reader UI | `app/_components/CourseReader.jsx` |

### Guarantees
- **The API key never reaches the browser.** Gemini is called only on the server. A build check confirmed no key, SDK or API host appears in `.next/static`.
- **No unvalidated AI output.** Every outline is checked for required non-empty fields and the exact chapter count the user asked for. Anything else is retried once and then replaced by a template that is clearly labelled as a fallback.
- **Users only see their own data.** Every read filters by the signed-in `userId`.
- **Bounded cost.** Chapters are limited to 1–20, topic and description lengths are capped, and each user can generate 5 courses per minute.

## Run it

```bash
npm install
# .env.local needs: GEMINI_API_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
npm run dev          # http://localhost:3000
npm test             # unit tests (Vitest)
npm run build        # production build
npm run eval -- my-label   # run the prompt/model eval (calls Gemini, writes artifacts/evals/)
```

## Agentic workflow (Claude Code)

| Layer | Where | What it does |
|---|---|---|
| Rules | `CLAUDE.md`, `.claude/rules/` | Standing instructions: security, AI-output contract, code quality, debugging. `ai-output.md` loads only for AI and API code |
| Skills | `.claude/skills/` | `/spec` → `/review` → `/land-the-plane`, plus `/eval-prompt` |
| Worker agents | `.claude/agents/` | explorer (haiku, read-only), builder (sonnet, edits), reviewer (sonnet, read-only). Each has a turn limit and none can start other agents |
| Hooks | `.claude/hooks/*.js` | Block writes to `.env` and user data, flag key-like strings and public key variables, block destructive git and shell commands, re-orient the agent each session |
| Hard denies | `.claude/settings.json` | Agent can't read or write `.env*` or `data/`, and can't run `rm -rf`, force push or `reset --hard` |

Each change goes through: **spec with acceptance tests → build → adversarial review → finish-line checks**. Records are kept in `artifacts/`: specs, the decision log and eval reports.

## Evaluation

`artifacts/evals/` holds the fixed test cases and dated reports. On 2026-11-24 the old prompt passed **6 of 8** cases: it returned malformed JSON for the 20-chapter case and for a prompt-injection case. The current pipeline passed **8 of 8**, using one retry in total, at about the same latency. See `artifacts/evals/eval_2026-11-24_server-validation.md`.

## Known limitations
- Storage is a JSON file, which is fine for a prototype but not safe for concurrent writes or serverless hosting. All storage access goes through `lib/courseStore.js`, so moving to Postgres or BigQuery means changing one file.
- The rate limiter is in-memory: it resets on restart and isn't shared across instances.
- The "Add Video" option is collected but not used yet.
