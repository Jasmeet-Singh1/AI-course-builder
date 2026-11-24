---
name: land-the-plane
description: Finish-line protocol. Run the gates, check the real app flow, update notes, and prepare the commit. User-invoked.
disable-model-invocation: true
---

# Land the Plane

Work is not done until every step below passes, or its failure is reported.

## Workflow
- [ ] `npm run build` passes. If it fails, stop and report the output.
- [ ] Tests pass (`npm test`), if a test script exists.
- [ ] Manual flow on `npm run dev`: sign in → /create-course → fill all 3 steps → Generate → preview all chapters → Save → /dashboard lists it → open it.
- [ ] If the change touched AI code: force a failure (e.g. invalid key, in a local session only) and confirm the fallback notice shows.
- [ ] Every acceptance test in the spec is ticked with how it was checked.
- [ ] No secrets in the diff: no `AIza`, `sk_`, or `-----BEGIN` strings, and no new `NEXT_PUBLIC_*` secret.
- [ ] Append a dated line to `artifacts/decisions.md` if a hard-to-reverse choice was made.
- [ ] Review `scratchpad/corrections.log` and propose rule updates for recurring corrections.
- [ ] Draft the commit message (imperative subject, a body with the why) and show it. Commit or push only when the user says to.

## Constraints
- NEVER report "done" with a failing gate. Report the failure verbatim instead.
- NEVER push without the user's go-ahead.
