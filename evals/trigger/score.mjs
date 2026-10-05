#!/usr/bin/env node
// Score a model's skill-selection answers.
//
//   node evals/trigger/score.mjs --version v1|v2 <answers.json> [more ...] [--json]
//
// answers.json is the JSON object the model returned for prompt.mjs:
//   {"1": "security-audit", "2": null, ...}

import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "../lib.mjs";

const args = process.argv.slice(2);
const version = args.includes("--version") ? args[args.indexOf("--version") + 1] : "v2";
const asJson = args.includes("--json");
const files = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--version");
if (!files.length) {
  console.error("usage: node evals/trigger/score.mjs --version v1|v2 <answers.json> [...]");
  process.exit(2);
}

const { queries } = JSON.parse(fs.readFileSync(path.join(repoRoot, "evals/trigger/queries.json"), "utf8"));
const key = version === "v1" ? "v1" : "expect";

function score(file) {
  const raw = fs.readFileSync(file, "utf8");
  const answers = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
  const r = { file: path.basename(file), correct: 0, total: queries.length, shouldTrigger: 0, triggeredRight: 0, shouldNot: 0, stayedQuiet: 0, loadsOnNoSkillTasks: 0, wrong: [] };
  for (const q of queries) {
    const got = answers[String(q.id)] ?? null;
    const accepted = q[key];
    const ok = accepted.includes(got);
    if (ok) r.correct++;
    else r.wrong.push(`${q.id}: got ${got}, accepted ${accepted.join(" | ")}`);
    // The split below always uses the current design's view of which requests need a skill,
    // so the two versions can be compared on the same footing.
    if (q.expect.includes(null)) {
      r.shouldNot++;
      if (got === null) r.stayedQuiet++;
      else r.loadsOnNoSkillTasks++;
    } else {
      r.shouldTrigger++;
      if (ok) r.triggeredRight++;
    }
  }
  return r;
}

const results = files.map(score);
if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  console.log(`Scored against the ${version} intent labels`);
  console.log("| Answers | Matches own design | Right skill on in-scope requests | Loads a skill on out-of-scope requests |");
  console.log("|---|---:|---:|---:|");
  for (const r of results) {
    console.log(`| ${r.file} | ${r.correct}/${r.total} | ${r.triggeredRight}/${r.shouldTrigger} | ${r.loadsOnNoSkillTasks}/${r.shouldNot} |`);
  }
  for (const r of results) if (r.wrong.length) console.log(`\n${r.file}\n  ` + r.wrong.join("\n  "));
}
