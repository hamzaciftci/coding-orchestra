#!/usr/bin/env node
// Static validation of the skill sets. Run from anywhere: node evals/validate.mjs
//
// Checks each skill against the Agent Skills specification (agentskills.io), this
// repository's own size budgets, link integrity, English/Turkish parity and the
// plugin manifests. Exits 1 on any error. Warnings do not fail the run.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { repoRoot, SKILL_ROOTS, parseFrontmatter, listSkills, walkFiles, estTokens } from "./lib.mjs";

const SPEC_KEYS = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_BODY_LINES = 120; // spec recommends < 500; this project keeps SKILL.md much leaner
const MAX_BODY_TOKENS = 2000; // spec recommends < 5000; estimates run high for Turkish
const MAX_REFERENCE_LINES = 200;

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const readRaw = (p) => fs.readFileSync(p);

function checkEncoding(rel, buf) {
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) err(rel, "has a UTF-8 BOM");
  if (buf.includes("\r\n")) err(rel, "has CRLF line endings");
  if (buf.length && buf[buf.length - 1] !== 0x0a) err(rel, "does not end with a newline");
}

function mdStructure(text) {
  const lines = text.split("\n");
  let inFence = false;
  const headings = [];
  let fences = 0;
  let tableRows = 0;
  const links = [];
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      if (inFence) fences++;
      continue;
    }
    if (inFence) continue;
    const h = /^(#{1,6})\s/.exec(line);
    if (h) headings.push(h[1].length);
    if (/^\s*\|.*\|\s*$/.test(line)) tableRows++;
  }
  for (const m of text.matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) {
    if (!/^[a-z]+:/i.test(m[1])) links.push(m[1]);
  }
  return { headings: headings.join(""), fences, tableRows, links: links.sort(), unclosedFence: inFence };
}

function checkSkill(rootRel, name, lang) {
  const dirRel = `${rootRel}/${name}`;
  const dir = path.join(repoRoot, dirRel);
  const skillRel = `${dirRel}/SKILL.md`;
  const buf = readRaw(path.join(dir, "SKILL.md"));
  checkEncoding(skillRel, buf);

  let fm;
  try {
    fm = parseFrontmatter(buf.toString("utf8"));
  } catch (e) {
    err(skillRel, e.message);
    return null;
  }
  const { data, body } = fm;
  if (!data) {
    err(skillRel, "missing YAML frontmatter");
    return null;
  }
  for (const key of Object.keys(data)) {
    if (!SPEC_KEYS.has(key)) err(skillRel, `frontmatter key "${key}" is not in the Agent Skills spec (tool-specific settings do not belong here)`);
  }
  if (!data.name) err(skillRel, "name is required");
  else {
    if (data.name !== name) err(skillRel, `name "${data.name}" does not match directory "${name}"`);
    if (!NAME_RE.test(data.name) || data.name.length > 64) err(skillRel, "name must be 1-64 chars of a-z, 0-9 and single hyphens");
    if (/claude|anthropic/.test(data.name)) err(skillRel, "name must not contain reserved words");
  }
  const desc = data.description ?? "";
  if (!desc) err(skillRel, "description is required");
  if ([...desc].length > 1024) err(skillRel, `description is ${[...desc].length} chars (max 1024)`);
  if (/[<>]/.test(desc)) err(skillRel, "description must not contain angle brackets");
  if (desc && !/\b(use when|use this)\b/i.test(desc) && !/kullan/i.test(desc)) warn(skillRel, "description does not say when to use the skill");
  if (data.compatibility && [...data.compatibility].length > 500) err(skillRel, "compatibility exceeds 500 chars");
  if (data.metadata && typeof data.metadata !== "object") err(skillRel, "metadata must be a map");
  for (const [k, v] of Object.entries(data.metadata ?? {})) {
    if (typeof v !== "string") err(skillRel, `metadata.${k} must be a string`);
  }

  const bodyLines = body.split("\n").length;
  if (bodyLines > MAX_BODY_LINES) err(skillRel, `body is ${bodyLines} lines (budget ${MAX_BODY_LINES})`);
  const bodyTokens = estTokens(body, lang);
  if (bodyTokens > MAX_BODY_TOKENS) err(skillRel, `body is about ${bodyTokens} tokens (budget ${MAX_BODY_TOKENS})`);

  const files = walkFiles(dir);
  const structures = {};
  for (const f of files) {
    const rel = `${dirRel}/${f}`;
    const fbuf = readRaw(path.join(dir, f));
    checkEncoding(rel, fbuf);
    const top = f.split("/")[0];
    if (f !== "SKILL.md" && !["references", "scripts", "assets", "agents"].includes(top)) {
      err(rel, "unexpected location; use references/, scripts/, assets/ or agents/");
    }
    if (f.split("/").length > 2) err(rel, "resources must sit one level below the skill directory");
    if (f.endsWith(".md")) {
      const text = fbuf.toString("utf8");
      const s = mdStructure(text);
      structures[f] = s;
      if (s.unclosedFence) err(rel, "unclosed code fence");
      for (const link of s.links) {
        const target = path.join(dir, path.dirname(f), link);
        if (!fs.existsSync(target)) err(rel, `broken relative link: ${link}`);
        if (f !== "SKILL.md") err(rel, `reference files should not link onward (${link}); keep references one level deep from SKILL.md`);
      }
      if (f.startsWith("references/")) {
        const n = text.split("\n").length;
        if (n > MAX_REFERENCE_LINES) err(rel, `reference is ${n} lines (budget ${MAX_REFERENCE_LINES})`);
        if (n > 100 && !/^## (Contents|İçindekiler)\s*$/m.test(text)) err(rel, "references over 100 lines need a contents section");
      }
      const shouting = (text.replace(/```[\s\S]*?```/g, "").match(/\b(MUST|NEVER|ALWAYS|CRITICAL|IMPORTANT|MANDATORY|ZORUNLU|ASLA)\b/g) ?? []).length;
      if (shouting) warn(rel, `${shouting} all-caps directive(s); prefer explaining the reason`);
    }
    if (f.endsWith(".mjs")) {
      try {
        execFileSync(process.execPath, ["--check", path.join(dir, f)], { stdio: "pipe" });
      } catch (e) {
        err(rel, `syntax error: ${String(e.stderr).split("\n")[0]}`);
      }
    }
  }

  // Every reference and script must be reachable from SKILL.md, or the agent never finds it.
  const skillText = buf.toString("utf8");
  for (const f of files) {
    if ((f.startsWith("references/") || f.startsWith("scripts/")) && !skillText.includes(f)) {
      err(skillRel, `does not mention ${f}`);
    }
  }
  for (const m of skillText.matchAll(/\b((?:references|scripts|assets)\/[\w.-]+)/g)) {
    if (!files.includes(m[1])) err(skillRel, `mentions missing file ${m[1]}`);
  }

  const yamlRel = "agents/openai.yaml";
  if (!files.includes(yamlRel)) err(dirRel, "missing agents/openai.yaml (Codex interface metadata)");
  else {
    const y = fs.readFileSync(path.join(dir, yamlRel), "utf8");
    for (const key of ["display_name", "short_description", "default_prompt"]) {
      if (!new RegExp(`^  ${key}: ".+"$`, "m").test(y)) err(`${dirRel}/${yamlRel}`, `missing interface.${key}`);
    }
  }

  return { data, files, structures, dir };
}

// --- per-language checks ---------------------------------------------------------
const sets = {};
for (const [lang, rootRel] of Object.entries(SKILL_ROOTS)) {
  const names = listSkills(rootRel);
  if (!names.length) err(rootRel, "no skills found");
  sets[lang] = Object.fromEntries(names.map((n) => [n, checkSkill(rootRel, n, lang)]));
  const total = names.reduce((sum, n) => sum + [...(sets[lang][n]?.data?.description ?? "")].length + n.length, 0);
  // Codex shortens descriptions when the listing passes about 8000 chars; Claude Code truncates each at 1536.
  if (total > 6000) warn(rootRel, `skill listing is ${total} chars; other installed skills share the same budget`);
}

// --- parity ------------------------------------------------------------------------
const en = sets.en;
const tr = sets.tr;
for (const name of new Set([...Object.keys(en), ...Object.keys(tr)])) {
  if (!en[name] || !tr[name]) {
    if (!(name in en)) err("parity", `${name} exists in Turkish only`);
    if (!(name in tr)) err("parity", `${name} exists in English only`);
    continue;
  }
  const a = en[name];
  const b = tr[name];
  if (a.files.join("\n") !== b.files.join("\n")) {
    const missing = a.files.filter((f) => !b.files.includes(f)).concat(b.files.filter((f) => !a.files.includes(f)));
    err(`parity/${name}`, `file trees differ: ${missing.join(", ")}`);
  }
  if (Object.keys(a.data).join() !== Object.keys(b.data).join()) err(`parity/${name}`, "frontmatter keys differ");
  if (a.data.metadata?.version !== b.data.metadata?.version) err(`parity/${name}`, "metadata.version differs");
  if (a.data.license !== b.data.license) err(`parity/${name}`, "license differs");
  for (const f of a.files) {
    if (!b.files.includes(f)) continue;
    if (f.endsWith(".mjs")) {
      if (!readRaw(path.join(a.dir, f)).equals(readRaw(path.join(b.dir, f)))) err(`parity/${name}/${f}`, "script differs between languages (run node evals/sync-scripts.mjs)");
    }
    if (f.endsWith(".md")) {
      const sa = a.structures[f];
      const sb = b.structures[f];
      if (sa.headings !== sb.headings) err(`parity/${name}/${f}`, `heading structure differs (en ${sa.headings} / tr ${sb.headings})`);
      if (sa.fences !== sb.fences) err(`parity/${name}/${f}`, `code block count differs (en ${sa.fences} / tr ${sb.fences})`);
      if (sa.tableRows !== sb.tableRows) err(`parity/${name}/${f}`, `table row count differs (en ${sa.tableRows} / tr ${sb.tableRows})`);
      if (f === "SKILL.md" && sa.links.join() !== sb.links.join()) err(`parity/${name}/${f}`, "relative links differ");
    }
  }
}

// --- manifests ---------------------------------------------------------------------
function readJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
  } catch (e) {
    err(rel, `cannot read or parse: ${e.message}`);
    return null;
  }
}
const market = readJson(".claude-plugin/marketplace.json");
const versions = new Set(Object.values(en).concat(Object.values(tr)).map((s) => s?.data?.metadata?.version));
if (versions.size !== 1) err("versions", `skills disagree on metadata.version: ${[...versions].join(", ")}`);
const version = [...versions][0];
if (market) {
  for (const p of market.plugins ?? []) {
    const src = typeof p.source === "string" ? p.source : null;
    if (!src) continue;
    const manifestRel = path.posix.join(src, ".claude-plugin/plugin.json");
    const manifest = readJson(manifestRel);
    if (!manifest) continue;
    if (manifest.name !== p.name) err(manifestRel, `name "${manifest.name}" does not match marketplace entry "${p.name}"`);
    if (manifest.version !== version) err(manifestRel, `version ${manifest.version} does not match skills (${version})`);
    if (!fs.existsSync(path.join(repoRoot, src, "skills"))) err(manifestRel, "plugin root has no skills/ directory");
  }
}
const changelog = fs.readFileSync(path.join(repoRoot, "CHANGELOG.md"), "utf8");
if (!changelog.includes(`[${version}]`)) err("CHANGELOG.md", `no entry for ${version}`);

// --- output ------------------------------------------------------------------------
for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
const count = Object.values(sets).reduce((n, s) => n + Object.keys(s).length, 0);
console.log(`${count} skills checked (${Object.keys(en).length} en, ${Object.keys(tr).length} tr): ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
