# Eval: after-review (2026-11-24)

Model: `gemini-2.5-flash` · Cases: `artifacts/evals/cases.json` (8) · Runner: `scripts/eval-prompt.mjs`

**Baseline** = the original client-side prompt, single attempt, JSON.parse only.
**Candidate** = `lib/courseGenerator.js`: delimited input + description, schema validation, one retry with errors, labelled fallback.

## Summary
| Metric | Baseline | Candidate |
|---|---|---|
| Parsed as JSON | 88% | 100% |
| Passed schema incl. exact chapter count (model output) | 88% | 100% |
| Needed a retry | n/a | 0 |
| Fell back to template (flagged) | n/a | 0 |
| Avg latency (s) | 8.5 | 8.2 |

Note: an invalid baseline answer would have been shown/saved as-is by the old code. An invalid candidate answer is never shown unflagged.

## Per case
| Case | Want | Baseline count / valid | Candidate count / result | Candidate course name (check on-topic by eye) |
|---|---|---|---|---|
| py-beginner-5 | 5 | 0 / ❌ | 5 / ✅ | Beginner Python Programming: Get Started with Code |
| one-chapter | 1 | 1 / ✅ | 1 / ✅ | Beginner's Guide to Hydration and Electrolytes |
| twelve-advanced | 12 | 12 / ✅ | 12 / ✅ | Advanced Distributed Systems: Consensus, Replication, and Fault Tolera |
| creative-intermediate | 6 | 6 / ✅ | 6 / ✅ | Intermediate Watercolour Landscapes: Techniques for Expressive Scenery |
| description-steers | 4 | 4 / ✅ | 4 / ✅ | Intermediate SQL: Mastering Window Functions and CTEs |
| water-quality | 5 | 5 / ✅ | 5 / ✅ | Reading a Municipal Water Quality Report |
| max-chapters | 20 | 20 / ✅ | 20 / ✅ | Introduction to JavaScript for Beginners |
| adversarial | 7 | 7 / ✅ | 7 / ✅ | Navigating Conflicting Instructions in Content Generation |

## Failures (raw reasons)
- **py-beginner-5** baseline: Expected ',' or '}' after property value in JSON at position 743 (line

## Human check
- [x] Injection: the candidate did not follow "2 chapters about cooking". It returned 7 chapters and no `secret` field. It still took the injected sentence as the topic.
- [x] Description is used (`description-steers` → "Window Functions and CTEs").

## Conclusion
The review fixes (escaped delimiter, whitelisted inputs, known-field projection, outer-fence-only parsing, timeout) did not hurt quality: the candidate passed 8 of 8 with no retries.

**Across both runs:** baseline 13/16 (81%: 6/8 then 7/8), candidate 16/16 (100%). (Corrected: an earlier version of this line and commit fb7c89c said 14/16.) The baseline failed **different cases in each run**: max-chapters and adversarial in run 1, py-beginner-5 in run 2. Every failure was malformed JSON. So the failures are random rather than tied to particular inputs, and that's why validate-and-retry is needed instead of more prompt tweaking.
