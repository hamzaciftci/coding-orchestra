#!/usr/bin/env node
// Build the skill-selection prompt for one skill set.
//
//   node evals/trigger/prompt.mjs --version v1|v2 [--lang en|tr] > prompt.txt
//
// The prompt shows a model exactly what an agent sees before any skill is loaded (each
// skill's name and description) and asks which skill, if any, it would load for each
// request. Give the prompt to any model and save its JSON answer for score.mjs.
//
// This is a proxy for real triggering: it isolates the descriptions from everything
// else in a session, and it asks about all requests in one call, which a real session
// never does. Use it to compare description sets, not to predict absolute rates.

import fs from "node:fs";
import path from "node:path";
import { repoRoot, listing } from "../lib.mjs";

const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const version = opt("--version", "v2");
const lang = opt("--lang", "en");

const skills = listing(version, lang);
const { queries } = JSON.parse(fs.readFileSync(path.join(repoRoot, "evals/trigger/queries.json"), "utf8"));

const lines = [];
lines.push("You are a coding agent. Before each task you may load at most one skill from the list below. A skill is a set of extra instructions that costs context to load, so you load one only when the request falls within what its description says it is for. For anything else you work without a skill.");
lines.push("");
lines.push("Available skills:");
for (const s of skills) lines.push(`- ${s.name}: ${s.description}`);
lines.push("");
lines.push("For each numbered request below, decide independently which skill you would load before starting, as if it were the only message from the user. Do not carry anything over between requests.");
lines.push("");
for (const q of queries) lines.push(`${q.id}. ${q.q}`);
lines.push("");
lines.push('Reply with only a JSON object mapping each request number to a skill name or null, for example {"1": "some-skill", "2": null}. No explanation.');

console.log(lines.join("\n"));
