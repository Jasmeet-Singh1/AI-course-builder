---
name: spec
description: Write a task spec with acceptance tests that an AI coding agent can build against. User-invoked.
argument-hint: "<feature or change to spec>"
disable-model-invocation: true
---

# Spec Writer

Turn a request into `artifacts/spec_<kebab-feature>.md` using `.claude/templates/spec.template.md`.

## Workflow
- [ ] Read the files the change touches (use `worker-explorer` if the scope is unclear).
- [ ] Fill every template section. Acceptance tests must be **checkable**: a command, an HTTP status, or a UI step with an expected result.
- [ ] Include at least one failure-path test (bad AI output, unauthenticated request, invalid input).
- [ ] List what is out of scope explicitly.
- [ ] If the change touches prompts or AI output, add an eval criterion (see `/eval-prompt`).
- [ ] Show the spec to the user and wait for approval before any implementation.

## Constraints
- NO implementation in this skill.
- ALWAYS name exact files and existing functions to reuse.
- Keep the scope to one PR (about 400 changed lines or fewer). Split anything bigger into numbered specs.

## Handoff
Give the spec path. Implementation is then done directly, or by `worker-builder` with the prompt "Implement artifacts/spec_<name>.md".

$ARGUMENTS
