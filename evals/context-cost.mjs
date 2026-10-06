#!/usr/bin/env node
// Compare the context footprint of v1 (git tag v1.1.0) with the current skills.
//
//   node evals/context-cost.mjs [--lang en|tr] [--json]
//
// Three kinds of cost are reported, because they are paid at different times:
//   always-on   name + description of every installed skill, present in every session
//   on trigger  the SKILL.md body, loaded when a skill activates
//   on demand   reference files, loaded only if the task needs them
// Token figures are character-based estimates for comparison, not billing.

import fs from "node:fs";
import path from "node:path";
import { repoRoot, V1_REF, V1_ROOTS, SKILL_ROOTS, parseFrontmatter, listSkills, gitList, gitShow, estTokens } from "./lib.mjs";

const args = process.argv.slice(2);
const lang = args.includes("--lang") ? args[args.indexOf("--lang") + 1] : "en";
const asJson = args.includes("--json");
const tok = (t) => estTokens(t, lang);

function loadV1() {
  const skills = {};
  for (const name of gitList(V1_REF, V1_ROOTS[lang])) {
    const text = gitShow(V1_REF, `${V1_ROOTS[lang]}/${name}/SKILL.md`);
    const { data, body } = parseFrontmatter(text);
    skills[name] = { listing: `${data.name}: ${data.description}`, body, references: {} };
  }
  return skills;
}

function loadV2() {
  const skills = {};
  for (const name of listSkills(SKILL_ROOTS[lang])) {
    const dir = path.join(repoRoot, SKILL_ROOTS[lang], name);
    const { data, body } = parseFrontmatter(fs.readFileSync(path.join(dir, "SKILL.md"), "utf8"));
    const references = {};
    const refDir = path.join(dir, "references");
    if (fs.existsSync(refDir)) {
      for (const f of fs.readdirSync(refDir)) references[f] = fs.readFileSync(path.join(refDir, f), "utf8");
    }
    skills[name] = { listing: `${data.name}: ${data.description}`, body, references };
  }
  return skills;
}

const v1 = loadV1();
const v2 = loadV2();
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const refs = (s) => sum(Object.values(s.references).map(tok));

function summarize(set) {
  const names = Object.keys(set);
  return {
    skills: names.length,
    alwaysOn: sum(names.map((n) => tok(set[n].listing))),
    bodyTotal: sum(names.map((n) => tok(set[n].body))),
    bodyMax: Math.max(...names.map((n) => tok(set[n].body))),
    bodyMean: Math.round(sum(names.map((n) => tok(set[n].body))) / names.length),
    referencesTotal: sum(names.map((n) => refs(set[n]))),
  };
}

// What a session actually loads for a few representative requests.
// v1 has no references; v2 loads the body and, at worst, every reference of the skill.
const scenarios = [
  {
    name: "Unrelated coding task, when the base skill triggers",
    v1: tok(v1["general-coding"].body), // v1's base skill claims every coding task
    v2Min: 0,
    v2Max: 0,
  },
  {
    name: "Fix a bug, when the bug-fix skill triggers",
    v1: tok(v1["bug-fix-refactor"].body),
    v2Min: 0,
    v2Max: 0,
  },
  {
    name: "Security audit",
    v1: tok(v1["security-audit"].body),
    v2Min: tok(v2["security-audit"].body),
    v2Max: tok(v2["security-audit"].body) + refs(v2["security-audit"]),
  },
  {
    name: "Add an API endpoint",
    v1: tok(v1["backend-engineering"].body),
    v2Min: tok(v2["backend-engineering"].body),
    v2Max: tok(v2["backend-engineering"].body) + refs(v2["backend-engineering"]),
  },
  {
    name: "Write a migration",
    v1: tok(v1["database-api-design"].body),
    v2Min: tok(v2["database-api-design"].body),
    v2Max: tok(v2["database-api-design"].body) + refs(v2["database-api-design"]),
  },
  {
    name: "Polish a UI",
    v1: tok(v1["ui-ux-polish"].body) + tok(v1["frontend-engineering"].body),
    v2Min: tok(v2["frontend-engineering"].body),
    v2Max: tok(v2["frontend-engineering"].body) + refs(v2["frontend-engineering"]),
  },
  {
    name: "Pre-deploy check",
    v1: tok(v1["deployment-readiness"].body),
    v2Min: tok(v2["deployment-readiness"].body),
    v2Max: tok(v2["deployment-readiness"].body) + refs(v2["deployment-readiness"]),
  },
  {
    name: "Full production delivery (orchestrator + every specialist it names)",
    v1: sum(Object.values(v1).map((s) => tok(s.body))),
    v2Min: tok(v2["production-delivery"].body) + refs(v2["production-delivery"]),
    v2Max: sum(Object.values(v2).map((s) => tok(s.body) + refs(s))),
  },
];

const result = { lang, v1: summarize(v1), v2: summarize(v2), scenarios };

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const pct = (a, b) => (b === 0 ? "n/a" : `${a <= b ? "-" : "+"}${Math.abs(Math.round((1 - a / b) * 100))}%`);
const out = [];
out.push(`## Context footprint (${lang}, estimated tokens)`);
out.push("");
out.push(`| | v1 (${V1_REF}) | current | change |`);
out.push("|---|---:|---:|---:|");
out.push(`| Skills | ${result.v1.skills} | ${result.v2.skills} | |`);
out.push(`| Always-on listing (all skills) | ${result.v1.alwaysOn} | ${result.v2.alwaysOn} | ${pct(result.v2.alwaysOn, result.v1.alwaysOn)} |`);
out.push(`| SKILL.md body, mean | ${result.v1.bodyMean} | ${result.v2.bodyMean} | ${pct(result.v2.bodyMean, result.v1.bodyMean)} |`);
out.push(`| SKILL.md body, largest | ${result.v1.bodyMax} | ${result.v2.bodyMax} | ${pct(result.v2.bodyMax, result.v1.bodyMax)} |`);
out.push(`| All SKILL.md bodies | ${result.v1.bodyTotal} | ${result.v2.bodyTotal} | ${pct(result.v2.bodyTotal, result.v1.bodyTotal)} |`);
out.push(`| Reference files (on demand) | ${result.v1.referencesTotal} | ${result.v2.referencesTotal} | |`);
out.push("");
out.push("| Request | v1 loads | current, body only | current, body + all its references |");
out.push("|---|---:|---:|---:|");
for (const s of scenarios) {
  out.push(`| ${s.name} | ${s.v1} | ${s.v2Min} (${pct(s.v2Min, s.v1)}) | ${s.v2Max} (${pct(s.v2Max, s.v1)}) |`);
}
console.log(out.join("\n"));
