# Debugging Protocol

## Three Before One
Before editing to fix a bug, write down three falsifiable hypotheses for the cause, then test the cheapest one first.

## Root Cause Mandate
A fix is not done until you can explain *why* it failed. "It works now" isn't an explanation.

## AI-Specific Checks
When a generation looks wrong, check in this order:
1. Was the request made at all? (network tab or server log)
2. Raw model text: did it return prose, fenced JSON, or truncated JSON?
3. Did it parse, and did it pass the schema?
4. Did the fallback fire silently? Look for `fallback: true`.

## Stale Context
Re-read a file before editing if more than about 20 tool calls have passed since you last read it, or after the conversation was summarised.

## Escalation
After three failed fix attempts, stop. Summarise what you tried and what you learned, then ask the user.
