#!/usr/bin/env node
// Run the security-audit task on the fixture under one condition and save the report.
//
//   node evals/audit/run.mjs --agent codex|claude --condition none|v1|v2 [--model NAME] [--out DIR] [--tag N]
//
// Conditions:  none = no skill, v1 = the v1.1.0 security-audit skill, v2 = the current one.
// The fixture is copied to a temporary directory outside the repository so the agent
// cannot see the answer key, and the skill under test is handed over as a file to read.
// That isolates the skill text from whatever skills are installed on this machine.
//
// Requires a logged-in `codex` or `claude` CLI. Both run read-only.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot, V1_REF, gitShow } from "../lib.mjs";

const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const agent = opt("--agent", "codex");
const condition = opt("--condition", "v2");
const model = opt("--model", null);
const tag = opt("--tag", "1");
const outDir = path.resolve(opt("--out", path.join(repoRoot, "evals/results/local")));

if (!["codex", "claude"].includes(agent) || !["none", "v1", "v2"].includes(condition)) {
  console.error("usage: node evals/audit/run.mjs --agent codex|claude --condition none|v1|v2 [--model NAME] [--out DIR] [--tag N]");
  process.exit(2);
}

const work = fs.mkdtempSync(path.join(os.tmpdir(), "co-audit-"));
fs.cpSync(path.join(repoRoot, "evals/fixtures/leaky-shop"), path.join(work, "app-under-audit"), { recursive: true });
fs.rmSync(path.join(work, "app-under-audit/README.md"), { force: true });

let preamble = "Do not use any installed skills for this task.";
if (condition !== "none") {
  const skillDir = path.join(work, "skill", "security-audit");
  if (condition === "v1") {
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, "SKILL.md"), gitShow(V1_REF, "skills-en/security-audit/SKILL.md"));
  } else {
    fs.cpSync(path.join(repoRoot, "skills/security-audit"), skillDir, { recursive: true });
  }
  preamble =
    "A skill has been loaded for this task. Before anything else, read skill/security-audit/SKILL.md and treat it as your operating instructions. " +
    "Relative paths in the skill resolve against skill/security-audit/. Do not use any other installed skills.";
}
const task = fs.readFileSync(path.join(repoRoot, "evals/audit/task.md"), "utf8").trim();
const prompt = `${preamble}\n\n${task}\n\nDo not modify or create files. Your final message must be the complete report itself.`;

const name = `${agent}${model ? `-${model}` : ""}-${condition}-${tag}`;
fs.mkdirSync(outDir, { recursive: true });
const reportFile = path.join(outDir, `${name}.md`);
const started = Date.now();
let meta = { agent, model, condition, tag };

if (agent === "codex") {
  const cmd = ["exec", "--skip-git-repo-check", "-s", "read-only", "-C", work, "-o", reportFile, "--json"];
  if (model) cmd.push("-m", model);
  cmd.push("-");
  const res = spawnSync("codex", cmd, { input: prompt, encoding: "utf8", shell: process.platform === "win32", maxBuffer: 1 << 28 });
  if (res.status !== 0) {
    console.error(res.stderr || res.stdout);
    process.exit(1);
  }
  // The last token_count / turn.completed event carries cumulative usage.
  const usage = res.stdout
    .split("\n")
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter((e) => e && (e.usage || e.type === "turn.completed"))
    .pop();
  meta.usage = usage?.usage ?? null;
} else {
  const cmd = ["-p", "--output-format", "json", "--disable-slash-commands", "--strict-mcp-config", "--allowedTools", "Read,Glob,Grep,Bash(node:*)"];
  if (model) cmd.push("--model", model);
  const res = spawnSync("claude", cmd, { input: prompt, cwd: work, encoding: "utf8", maxBuffer: 1 << 28 });
  let parsed;
  try {
    parsed = JSON.parse(res.stdout);
  } catch {
    console.error(res.stderr || res.stdout);
    process.exit(1);
  }
  if (parsed.is_error) {
    console.error(`claude: ${parsed.result}`);
    process.exit(1);
  }
  fs.writeFileSync(reportFile, parsed.result);
  meta.usage = parsed.usage;
  meta.turns = parsed.num_turns;
  meta.costUsd = parsed.total_cost_usd;
}

if (!fs.existsSync(reportFile) || fs.statSync(reportFile).size === 0) {
  fs.rmSync(reportFile, { force: true });
  console.error(`${name}: the agent returned no report. Check that the CLI is logged in and up to date.`);
  process.exit(1);
}

meta.seconds = Math.round((Date.now() - started) / 1000);
fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(meta, null, 2) + "\n");
fs.rmSync(work, { recursive: true, force: true });
console.log(`${name}: report saved to ${path.relative(repoRoot, reportFile)} (${meta.seconds}s)`);
