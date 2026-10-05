#!/usr/bin/env node
// Compare the environment variables a project reads with what it documents.
// Read-only, no dependencies, and it never opens a real env file: it reads source code
// and the example file only, and reports variable NAMES, never values.
//
//   node env-inventory.mjs [project-dir] [--json]

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const root = path.resolve(args.find((a) => !a.startsWith("--")) ?? ".");

const SKIP_DIRS = new Set([
  "node_modules", ".next", ".git", "dist", "build", "out", "coverage", ".vercel", ".turbo", ".cache",
]);
const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|prisma|toml|ya?ml)$/;
const EXAMPLE_FILES = [".env.example", ".env.sample", ".env.template", ".env.local.example", "env.example"];
// Set by the platform or the runtime; nobody documents these.
const PLATFORM = /^(NODE_ENV|CI|PORT|HOSTNAME|TZ|NEXT_RUNTIME|NEXT_PHASE|VERCEL|VERCEL_[A-Z0-9_]+|NEXT_PUBLIC_VERCEL_[A-Z0-9_]+|npm_[a-z_]+)$/;
const PUBLIC_PREFIX = /^(NEXT_PUBLIC_|VITE_|PUBLIC_|EXPO_PUBLIC_|REACT_APP_)/;
const SECRET_NAME = /(SECRET|PRIVATE|PASSWORD|PASSWD|SERVICE_ROLE|TOKEN|CREDENTIAL|_KEY$|DATABASE_URL|DSN$)/;
// Names that look secret but are designed to be public.
const PUBLIC_BY_DESIGN = /(ANON_KEY|PUBLISHABLE|PUBLIC_KEY|SITE_KEY|MAPS_API_KEY|POSTHOG_KEY|SENTRY_DSN|ANALYTICS|MEASUREMENT_ID)/;

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), out);
    } else if (SOURCE_EXT.test(e.name) && !e.name.startsWith(".env")) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

const rel = (f) => path.relative(root, f).split(path.sep).join("/");

const used = new Map(); // name -> Set(files)
const clientUse = new Map(); // server-only name read in a "use client" file -> Set(files)
let validation = null;

const PATTERNS = [
  /process\.env\.([A-Z][A-Z0-9_]*)/g,
  /process\.env\[\s*["']([A-Z][A-Z0-9_]*)["']\s*\]/g,
  /import\.meta\.env\.([A-Z][A-Z0-9_]*)/g,
  /\benv\(\s*["']([A-Z][A-Z0-9_]*)["']\s*\)/g,
  /Deno\.env\.get\(\s*["']([A-Z][A-Z0-9_]*)["']\s*\)/g,
];

for (const f of walk(root)) {
  let src;
  try {
    src = fs.readFileSync(f, "utf8");
  } catch {
    continue;
  }
  const r = rel(f);
  const isClient = /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(src);
  if (!validation && /createEnv\(|z\.object\([\s\S]{0,400}process\.env|\.parse\(\s*process\.env|safeParse\(\s*process\.env/.test(src)) {
    validation = r;
  }
  for (const re of PATTERNS) {
    for (const m of src.matchAll(re)) {
      const name = m[1];
      if (PLATFORM.test(name)) continue;
      if (!used.has(name)) used.set(name, new Set());
      used.get(name).add(r);
      if (isClient && !PUBLIC_PREFIX.test(name)) {
        if (!clientUse.has(name)) clientUse.set(name, new Set());
        clientUse.get(name).add(r);
      }
    }
  }
}

const exampleFile = EXAMPLE_FILES.find((f) => fs.existsSync(path.join(root, f))) ?? null;
const documented = new Set();
const exampleWithValues = [];
if (exampleFile) {
  for (const line of fs.readFileSync(path.join(root, exampleFile), "utf8").split(/\r?\n/)) {
    const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/.exec(line);
    if (!m) continue;
    documented.add(m[1]);
    const value = m[2].trim().replace(/^["']|["']$/g, "");
    if (value.length >= 20 && SECRET_NAME.test(m[1]) && !/(your|example|changeme|xxx|placeholder|<|\.\.\.)/i.test(value)) {
      exampleWithValues.push(m[1]);
    }
  }
}

let trackedEnvFiles = [];
try {
  trackedEnvFiles = execFileSync("git", ["ls-files", "--", ".env", ".env.*", "**/.env", "**/.env.*"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  })
    .split(/\r?\n/)
    .filter((f) => f && !/(example|sample|template)/i.test(f));
} catch {
  // not a git repository, or git missing: skip this check
}

const names = [...used.keys()].sort();
const result = {
  exampleFile,
  validation,
  used: names.map((n) => ({ name: n, files: [...used.get(n)].sort() })),
  undocumented: names.filter((n) => !documented.has(n)),
  unused: [...documented].filter((n) => !used.has(n) && !PLATFORM.test(n)).sort(),
  publicLooksSecret: [...new Set([...names, ...documented])]
    .filter((n) => PUBLIC_PREFIX.test(n) && SECRET_NAME.test(n) && !PUBLIC_BY_DESIGN.test(n))
    .sort(),
  serverVarInClientFile: [...clientUse.keys()].sort().map((n) => ({ name: n, files: [...clientUse.get(n)].sort() })),
  exampleWithValues,
  trackedEnvFiles,
};

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const out = [];
const list = (items, fmt = (x) => `- \`${x}\``) => (items.length ? items.map(fmt).join("\n") : "None.");
out.push(`# Environment inventory — ${path.basename(root)}`);
out.push("");
out.push("Names only. This script reads source files and the example file; it never opens a real env file.");
out.push("");
out.push(`- Example file: ${exampleFile ? `\`${exampleFile}\`` : "**missing**"}`);
out.push(`- Startup validation: ${validation ? `looks present in \`${validation}\`` : "**none detected** (a missing variable will fail at first use, not at boot)"}`);
out.push(`- Variables read by the code: ${names.length}`);
out.push("");
out.push("## Public prefix on a secret-looking name");
out.push("These are inlined into the browser bundle. If any of them is a real secret, treat it as leaked: rotate it, then move it server-side.");
out.push(list(result.publicLooksSecret));
out.push("");
out.push("## Server variable read in a client file");
out.push("Without a public prefix the value is undefined in the browser; with one it would be exposed. Either way the code is wrong.");
out.push(list(result.serverVarInClientFile, (x) => `- \`${x.name}\` — ${x.files.map((f) => `\`${f}\``).join(", ")}`));
out.push("");
out.push("## Read by the code but not in the example file");
out.push("Likely to be missing in production. Confirm each is set on the platform, then document it.");
out.push(list(result.undocumented, (n) => `- \`${n}\` — ${[...used.get(n)].sort().map((f) => `\`${f}\``).join(", ")}`));
out.push("");
out.push("## In the example file but never read");
out.push(list(result.unused));
out.push("");
out.push("## Env files tracked by git");
out.push(
  trackedEnvFiles.length
    ? "These are committed. Assume every secret in them is compromised and rotate; deleting the file does not remove it from history.\n" + list(trackedEnvFiles)
    : "None.",
);
if (exampleWithValues.length) {
  out.push("");
  out.push("## Example file entries that look like real values");
  out.push(list(exampleWithValues));
}

console.log(out.join("\n"));
