---
name: review
description: Adversarial review of the current change against its spec and the repo rules. User-invoked.
argument-hint: "[spec path]"
disable-model-invocation: true
---

# Adversarial Review

## Workflow
- [ ] Identify the change: `git diff` if git is available, otherwise the files named in the spec or by the user.
- [ ] Launch `worker-reviewer` with the spec path and the list of changed files. Don't paste the whole conversation.
- [ ] Verify each finding yourself by reading the cited lines. Drop any that don't hold up.
- [ ] Present the verified findings, most severe first, with the verdict.
- [ ] Ask before fixing anything.

## Constraints
- NO edits during review.
- Critical or High findings block `/land-the-plane`.

$ARGUMENTS
