#!/usr/bin/env node
// SessionStart hook: prints a short re-orientation block that Claude sees as context.
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const lines = ["## Session re-orientation (from .claude/hooks/session-start.js)"];

// Open specs = spec files whose Status line isn't Done.
try {
  const dir = path.join(root, "artifacts");
  const open = fs
    .readdirSync(dir)
    .filter((f) => /^spec_.*\.md$/.test(f))
    .filter((f) => !/\*\*Status:\*\*\s*Done/i.test(fs.readFileSync(path.join(dir, f), "utf8")));
  lines.push(open.length ? `- Open specs: ${open.map((f) => "artifacts/" + f).join(", ")}. Re-read before continuing.` : "- No open specs.");
} catch {
  lines.push("- No artifacts/ folder found.");
}

// Pending corrections.
try {
  const log = fs.readFileSync(path.join(root, "scratchpad", "corrections.log"), "utf8").trim();
  const n = log ? log.split(/\r?\n/).length : 0;
  if (n) lines.push(`- ${n} entr${n === 1 ? "y" : "ies"} in scratchpad/corrections.log. Review them in /land-the-plane.`);
} catch {}

lines.push("- Re-read any file before editing it if it was last read long ago or before a summary.");
lines.push("- Gate: `npm run build` + manual flow. AI output must be validated (rules/ai-output.md).");

process.stdout.write(lines.join("\n") + "\n");
process.exit(0);
