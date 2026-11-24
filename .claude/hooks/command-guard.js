#!/usr/bin/env node
// PreToolUse hook for Bash|PowerShell.
// Blocks destructive or secret-leaking shell commands. Fail-open, visibly.
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
  process.stderr.write("[HOOK DEGRADATION] command-guard could not parse input; command not checked.\n");
  process.exit(0);
}

const cmd = String((input.tool_input || {}).command || "");
// Disclosed escape hatch: a user-approved push to main/master must say so in the command itself.
const mainPushApproved = /CLAUDE_ALLOW_MAIN_PUSH\s*=\s*['"]?1/.test(cmd);

const deny = [
  [/\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/i, "Recursive force delete (rm -rf) is blocked."],
  [/\b(Remove-Item|rm|del|ri|rmdir|rd)\b(?=[^|;]*-Recurse)(?=[^|;]*-Force)/i, "Recursive forced delete (Remove-Item -Recurse -Force) is blocked. Delete specific files instead."],
  [/git\s+push\b[^|;]*(--force|-f\b)/i, "Force push is blocked."],
  [/git\s+push\b[^|;]*\b(origin\s+)?(main|master)\b/i, "Pushing directly to main/master is blocked. Use a branch and PR."],
  [/git\s+reset\s+--hard/i, "git reset --hard is blocked: it discards work."],
  [/git\s+clean\s+-[a-z]*f/i, "git clean -f is blocked: it deletes untracked files."],
  [/(cat|type|Get-Content|gc|more|less|Select-String)\b[^|;]*\.env/i, "Reading .env files is blocked (security.md)."],
  [/(cat|type|Get-Content|gc)\b[^|;]*data[\\/]+courses\.json/i, "data/courses.json holds user emails; don't print it."],
  [/(curl|iwr|Invoke-WebRequest|wget)\b[^|]*\|\s*(sh|bash|iex|Invoke-Expression)/i, "Piping a download into a shell is blocked."],
];
for (const [re, reason] of deny) {
  if (re.test(cmd)) {
    if (mainPushApproved && reason.startsWith("Pushing directly to main/master")) continue;
    decide("deny", reason);
  }
}

if (/\bnpm\s+(i|install|add)\s+\S/i.test(cmd)) {
  decide("ask", "Adds a dependency. tech-strategy.md requires a stated reason. Confirm.");
}

process.exit(0);
