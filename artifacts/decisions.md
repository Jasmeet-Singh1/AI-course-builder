# Decision Log

One entry per hard-to-reverse decision. Newest first.

Format: `YYYY-MM-DD | decision | why | alternatives considered`

- 2026-11-24 | Gemini called only from the server (`/api/generate`), with schema validation, one retry carrying the errors, then a labelled fallback | The key was shipped in the client bundle, and output was only JSON-parsed. Eval: 6/8 → 8/8 | Keep it client-side with key restrictions (still exposes the key); validate on the client (can be bypassed)
- 2026-11-24 | Accept (for now) that a client can mislabel a fallback course as model-generated on save | `toCleanCourse` blocks extra fields and non-boolean flags, but where a course came from can't be proven without server state | Sign generation results (HMAC) or persist them server-side at generation time. Revisit before going public
- 2026-11-24 | Hand-written validator instead of zod | One schema and no new dependency. Fully unit-tested | zod (revisit if schemas multiply)
- 2026-11-24 | In-memory per-user rate limit (5/min) | Bounds spend with no infrastructure | Upstash/Redis (needed once there are multiple instances)
- 2026-11-24 | Adopted the `.claude/` agentic workflow (rules, skills, worker agents, Node hooks) | Gives specs, review and guardrails a fixed shape for AI-assisted development | No config (ad-hoc prompting); a copy of the bash-based framework (doesn't run on this Windows setup)
- (earlier) | Store saved courses in `data/courses.json` | Fastest prototype, no DB setup | Postgres, Firebase. Revisit before deploying
- (earlier) | Gemini 2.5 Flash in JSON mode | Cheap, fast, native JSON output | Claude / OpenAI. Compare with `/eval-prompt`
