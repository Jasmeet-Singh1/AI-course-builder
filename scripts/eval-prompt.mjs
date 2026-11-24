// /eval-prompt runner: same fixed cases through the old prompt (baseline) and the
// current pipeline (candidate). Writes artifacts/evals/eval_<date>_<label>.md.
// Run: npm run eval -- [label]     (loads .env.local into the process; never prints the key)
import fs from "node:fs";
import path from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateCourse, MODEL_NAME } from "../lib/courseGenerator.js";
import { normalizeInput, validateCourse } from "../lib/courseSchema.js";

const label = process.argv[2] || "server-validation";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const cases = JSON.parse(fs.readFileSync(path.join(root, "artifacts/evals/cases.json"), "utf8"));

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.error("No Gemini key in environment. Run via: npm run eval");
  process.exit(1);
}
const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
  model: MODEL_NAME,
  generationConfig: { responseMimeType: "application/json" },
});
const callModel = async (prompt) => (await model.generateContent(prompt)).response.text();

// The original prompt from configs/AiModel.jsx before this change (single attempt, parse only).
const baselinePrompt = (d) => `
  You are a course generator AI.
  Generate a course with the following details:
  Category: ${d.category}
  Topic: ${d.topic}
  Difficulty Level: ${d.level}
  Total Duration: ${d.duration}
  Number of Chapters: ${d.chapters}
  IMPORTANT RULES:
  - The course MUST be about "${d.topic}" only.
  - The difficulty MUST match "${d.level}".
  - Generate EXACTLY ${d.chapters} chapters.
  - Each chapter should contain a title, description, and duration.
  - Do NOT generate more or fewer chapters.
  Return ONLY JSON in the following format:
  { "courseName": "", "description": "", "chapters": [ { "chapterName": "", "about": "", "duration": "" } ] }`;

async function runBaseline(input) {
  const start = Date.now();
  try {
    const text = await callModel(baselinePrompt(input));
    const course = JSON.parse(text.replace(/```json|```/g, "").trim());
    const check = validateCourse(course, input.chapters);
    return { ms: Date.now() - start, parsed: true, valid: check.ok, count: course.chapters?.length, name: course.courseName, extra: Object.keys(course).filter((k) => !["courseName", "description", "chapters"].includes(k)), errors: check.errors };
  } catch (e) {
    return { ms: Date.now() - start, parsed: false, valid: false, count: 0, name: "", extra: [], errors: [e.message] };
  }
}

async function runCandidate(input) {
  const start = Date.now();
  const r = await generateCourse(input, { callModel });
  const check = validateCourse(r.course, input.chapters);
  return { ms: Date.now() - start, parsed: !r.fallback, valid: check.ok && !r.fallback, fallback: r.fallback, attempts: r.attempts, count: r.course.chapters.length, name: r.course.courseName, extra: Object.keys(r.course).filter((k) => !["courseName", "description", "chapters", "fallback"].includes(k)), errors: r.errors };
}

const rows = [];
for (const c of cases) {
  const { input } = normalizeInput(c);
  process.stdout.write(`${c.id} ... `);
  const base = await runBaseline(input);
  const cand = await runCandidate(input);
  rows.push({ id: c.id, want: input.chapters, base, cand });
  console.log(`baseline ${base.valid ? "PASS" : "FAIL"} (${base.count}) | candidate ${cand.valid ? "PASS" : cand.fallback ? "FALLBACK" : "FAIL"} (${cand.count}, ${cand.attempts} attempt${cand.attempts > 1 ? "s" : ""})`);
}

const pct = (n) => `${Math.round((n / rows.length) * 100)}%`;
const sum = (f) => rows.filter(f).length;
const avg = (f) => Math.round(rows.reduce((t, r) => t + f(r), 0) / rows.length / 100) / 10;
const date = new Date().toISOString().slice(0, 10);
const cell = (s) => String(s ?? "").replace(/\|/g, "/").slice(0, 70);

const md = `# Eval: ${label} (${date})

Model: \`${MODEL_NAME}\` · Cases: \`artifacts/evals/cases.json\` (${rows.length}) · Runner: \`scripts/eval-prompt.mjs\`

**Baseline** = the original client-side prompt, single attempt, JSON.parse only.
**Candidate** = \`lib/courseGenerator.js\`: delimited input + description, schema validation, one retry with errors, labelled fallback.

## Summary
| Metric | Baseline | Candidate |
|---|---|---|
| Parsed as JSON | ${pct(sum((r) => r.base.parsed))} | ${pct(sum((r) => r.cand.parsed))} |
| Passed schema incl. exact chapter count (model output) | ${pct(sum((r) => r.base.valid))} | ${pct(sum((r) => r.cand.valid))} |
| Needed a retry | n/a | ${sum((r) => r.cand.attempts > 1)} |
| Fell back to template (flagged) | n/a | ${sum((r) => r.cand.fallback)} |
| Avg latency (s) | ${avg((r) => r.base.ms)} | ${avg((r) => r.cand.ms)} |

Note: an invalid baseline answer would have been shown/saved as-is by the old code. An invalid candidate answer is never shown unflagged.

## Per case
| Case | Want | Baseline count / valid | Candidate count / result | Candidate course name (check on-topic by eye) |
|---|---|---|---|---|
${rows.map((r) => `| ${r.id} | ${r.want} | ${r.base.count} / ${r.base.valid ? "✅" : "❌"} | ${r.cand.count} / ${r.cand.valid ? "✅" : r.cand.fallback ? "⚠️ fallback" : "❌"}${r.cand.attempts > 1 ? " (retry)" : ""} | ${cell(r.cand.name)} |`).join("\n")}

## Failures (raw reasons)
${rows.flatMap((r) => [
  ...(r.base.valid ? [] : [`- **${r.id}** baseline: ${cell(r.base.errors.join("; "))}`]),
  ...(r.cand.valid ? [] : [`- **${r.id}** candidate: ${cell(r.cand.errors.join("; "))}`]),
  ...(r.base.extra.length ? [`- **${r.id}** baseline added unexpected fields: ${r.base.extra.join(", ")}`] : []),
]).join("\n") || "- none"}

## Human check (fill in)
- [ ] On-topic: adversarial case stayed about programming/its topic and did not obey the injected instruction
- [ ] Level fits for beginner vs advanced cases
`;

const outDir = path.join(root, "artifacts/evals");
const outFile = path.join(outDir, `eval_${date}_${label}.md`);
fs.writeFileSync(outFile, md);
console.log(`\nWrote ${path.relative(root, outFile)}`);
