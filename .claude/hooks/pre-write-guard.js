#!/usr/bin/env node
// PreToolUse hook for Write|Edit|MultiEdit.
// Blocks writes to secret/user-data files, asks before writing likely secrets,
// public-prefixed key names, or the agent's own config. Fail-open, visibly.
const fs = require("fs");

function decide(decision, reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: decision,
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

let input;
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
} catch (e) {
  process.stderr.write("[HOOK DEGRADATION] pre-write-guard could not parse input; write not checked.\n");
  process.exit(0);
}

const ti = input.tool_input || {};
const filePath = String(ti.file_path || "").replace(/\\/g, "/");
const edits = Array.isArray(ti.edits) ? ti.edits.map((e) => e.new_string || "") : [];
const content = [ti.content, ti.new_string, ...edits].filter(Boolean).join("\n");
const base = filePath.split("/").pop() || "";

// 1. Hard blocks: env files and saved user data.
if (/^\.env/.test(base)) {
  decide("deny", "Writing .env files is blocked (security.md). Ask the user to change env values themselves.");
}
if (/(^|\/)data\/courses\.json$/.test(filePath)) {
  decide("deny", "data/courses.json holds user emails and is written only by lib/courseStore.js at runtime.");
}

// 2. Likely secrets in content (skip template/rule docs that describe patterns).
const isDocs = /\.claude\/|\.md$/.test(filePath);
const secretPatterns = [
  [/AIza[0-9A-Za-z_\-]{35}/, "Google API key"],
  [/sk_(live|test)_[0-9A-Za-z]{10,}/, "Clerk/Stripe secret key"],
  [/ghp_[0-9A-Za-z]{36}/, "GitHub token"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
];
if (!isDocs) {
  for (const [re, label] of secretPatterns) {
    if (re.test(content)) decide("ask", `Content looks like a ${label}. Secrets belong in .env.local, never in source.`);
  }
}

// 3. New public env var that looks secret (Clerk publishable key is meant to be public).
if (!isDocs) {
  const pub = content.match(/NEXT_PUBLIC_[A-Z0-9_]*(KEY|SECRET|TOKEN)[A-Z0-9_]*/g) || [];
  const risky = pub.filter((n) => n !== "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  if (risky.length) {
    decide("ask", `Uses ${[...new Set(risky)].join(", ")}: NEXT_PUBLIC_ vars ship to the browser. Prefer a server-only var (security.md).`);
  }
}

// 4. Agent config changes need a human look.
if (/(^|\/)(CLAUDE\.md|\.claude\/settings\.json|\.claude\/rules\/[^/]+|\.claude\/hooks\/[^/]+)$/.test(filePath)) {
  decide("ask", "This edits the agent's own rules/config. Confirm the change is intended.");
}

process.exit(0);
