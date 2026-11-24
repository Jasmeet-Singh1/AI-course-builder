# Core Directives

## Purpose
Standing rules for every session in this repo. When rules conflict, follow the Decision Hierarchy below.

## Seven Rules

1. **Tech strategy is authoritative.** Use the stack in `tech-strategy.md`. Don't add a library, framework or service without stating why in the spec.
2. **Check skills first.** Before an ad-hoc workflow, check `.claude/skills/` for one that already covers it.
3. **Spec before code for anything beyond trivial.** The spec names the files, the acceptance tests and what is out of scope (`/spec`).
4. **Verify, don't assume.** Run `npm run build` after changes. For UI or AI changes, run the flow in the browser. Report real results, including failures.
5. **Durable artifacts go in `./artifacts/`.** Specs, decisions and eval results.
6. **Ephemeral notes go in `./scratchpad/`.** Never commit it.
7. **One concern per change.** Don't mix refactors with features. Keep diffs reviewable (about 400 changed lines or fewer).

## Decision Hierarchy
Security > AI-output correctness > Tech Strategy > Core Directives > Skill conventions > Local judgment.

## Output Standards
- **Commits:** imperative subject ≤ 72 chars (`Move Gemini call to server route`). The body says why.
- **Specs and handoffs:** always reference the artifact path, so the next agent or person can pick up from the file alone.
- **Correction capture:** when the user corrects a behaviour that contradicts a rule here, append one line to `scratchpad/corrections.log` in the form `YYYY-MM-DD | correction | which rule/file`. `/land-the-plane` reviews these entries and proposes rule updates.
