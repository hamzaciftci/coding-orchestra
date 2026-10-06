// Shared helpers for the eval and validation scripts. No dependencies.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const V1_REF = "v1.1.0";
export const SKILL_ROOTS = { en: "skills", tr: "locales/tr/skills" };
export const V1_ROOTS = { en: "skills-en", tr: "skills" };

// Minimal frontmatter parser for the subset used in SKILL.md files:
// top-level `key: value` pairs and one level of nested string maps.
export function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return { data: null, body: text, raw: "" };
  const data = {};
  let parent = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const nested = /^\s+([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    const top = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (top) {
      const value = unquote(top[2]);
      if (top[2] === "") {
        data[top[1]] = {};
        parent = top[1];
      } else {
        data[top[1]] = value;
        parent = null;
      }
    } else if (nested && parent) {
      data[parent][nested[1]] = unquote(nested[2]);
    } else {
      throw new Error(`unsupported frontmatter line: ${line}`);
    }
  }
  return { data, body: text.slice(m[0].length), raw: m[1] };
}

function unquote(v) {
  const t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
  return t;
}

export function listSkills(rootRel) {
  const root = path.join(repoRoot, rootRel);
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(root, d.name, "SKILL.md")))
    .map((d) => d.name)
    .sort();
}

export function walkFiles(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, base, out);
    else out.push(path.relative(base, p).split(path.sep).join("/"));
  }
  return out.sort();
}

export function gitShow(ref, file) {
  return execFileSync("git", ["show", `${ref}:${file}`], { cwd: repoRoot, encoding: "utf8", maxBuffer: 1 << 26 });
}

export function gitList(ref, dir) {
  return execFileSync("git", ["ls-tree", "--name-only", `${ref}:${dir}`], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

// The name + description pairs an agent keeps in context for every installed skill.
export function listing(version, lang) {
  if (version === "v1") {
    return gitList(V1_REF, V1_ROOTS[lang]).map((name) => {
      const { data } = parseFrontmatter(gitShow(V1_REF, `${V1_ROOTS[lang]}/${name}/SKILL.md`));
      return { name: data.name, description: data.description };
    });
  }
  return listSkills(SKILL_ROOTS[lang]).map((name) => {
    const { data } = parseFrontmatter(fs.readFileSync(path.join(repoRoot, SKILL_ROOTS[lang], name, "SKILL.md"), "utf8"));
    return { name: data.name, description: data.description };
  });
}

// Rough token estimate. Real tokenizers differ by model; this is for comparing sizes,
// not for billing. Turkish text tokenizes less efficiently than English.
export const estTokens = (text, lang = "en") => Math.round([...text].length / (lang === "tr" ? 3 : 4));
