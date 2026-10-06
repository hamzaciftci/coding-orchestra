#!/usr/bin/env node
// Score audit reports against the seeded-flaw answer key.
//
//   node evals/audit/grade.mjs <report.md> [more reports ...] [--json] [--missed]
//
// Deterministic keyword grading: cheap and repeatable, but it only shows that a report
// mentions a flaw, not that it explains it well. Read a sample of reports as well.

import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "../lib.mjs";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const showMissed = args.includes("--missed");
const files = args.filter((a) => !a.startsWith("--"));
if (!files.length) {
  console.error("usage: node evals/audit/grade.mjs <report.md> [...] [--json] [--missed]");
  process.exit(2);
}

const key = JSON.parse(fs.readFileSync(path.join(repoRoot, "evals/audit/answers.json"), "utf8"));
const hit = (text, patterns) => patterns.some((p) => new RegExp(p, "i").test(text));

export function grade(text) {
  const found = {};
  for (const issue of key.issues) found[issue.id] = hit(text, issue.match);
  const qualities = {};
  for (const q of key.qualities) qualities[q.id] = hit(text, q.match);
  const tier = (t) => key.issues.filter((i) => i.tier === t);
  const count = (t) => tier(t).filter((i) => found[i.id]).length;
  return {
    basic: `${count("basic")}/${tier("basic").length}`,
    stack: `${count("stack")}/${tier("stack").length}`,
    total: `${count("basic") + count("stack")}/${key.issues.length}`,
    qualities: `${Object.values(qualities).filter(Boolean).length}/${key.qualities.length}`,
    words: text.split(/\s+/).length,
    missed: key.issues.filter((i) => !found[i.id]).map((i) => i.id),
    missedQualities: key.qualities.filter((q) => !qualities[q.id]).map((q) => q.id),
  };
}

const results = files.map((f) => ({ report: path.basename(f), ...grade(fs.readFileSync(f, "utf8")) }));

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  console.log("| Report | Basic | Stack-specific | Total | Report qualities | Words |");
  console.log("|---|---:|---:|---:|---:|---:|");
  for (const r of results) console.log(`| ${r.report} | ${r.basic} | ${r.stack} | ${r.total} | ${r.qualities} | ${r.words} |`);
  if (showMissed) {
    for (const r of results) {
      console.log(`\n${r.report}\n  missed: ${r.missed.join(", ") || "none"}\n  qualities missing: ${r.missedQualities.join(", ") || "none"}`);
    }
  }
}
