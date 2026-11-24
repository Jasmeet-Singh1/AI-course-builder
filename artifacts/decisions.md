# Decision Log

One entry per hard-to-reverse decision. Newest first.

Format: `YYYY-MM-DD | decision | why | alternatives considered`

- 2026-11-24 | Adopted the `.claude/` agentic workflow (rules, skills, worker agents, Node hooks) | Gives specs, review and guardrails a fixed shape for AI-assisted development | No config (ad-hoc prompting); a copy of the bash-based framework (doesn't run on this Windows setup)
- (earlier) | Store saved courses in `data/courses.json` | Fastest prototype, no DB setup | Postgres, Firebase. Revisit before deploying
- (earlier) | Gemini 2.5 Flash in JSON mode | Cheap, fast, native JSON output | Claude / OpenAI. Compare with `/eval-prompt`
