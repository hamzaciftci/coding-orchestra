#!/usr/bin/env node
// Inventory the server-side entry points of a Next.js / Node project so an audit starts
// from a complete list instead of ad-hoc grepping. Read-only, no dependencies.
//
//   node attack-surface.mjs [project-dir] [--json]
//
// Lists route handlers, Pages API routes, Server Actions, middleware/proxy matchers and
// vercel.json crons, with text-based signals per entry, then the things that are not
// entry points: tables in SQL files with their row level security state, and code
// patterns that are wrong more often than not. Everything here is a hint for where to
// read: a missing signal means "open this file", a present one proves nothing.

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const root = path.resolve(args.find((a) => !a.startsWith("--")) ?? ".");

const SKIP_DIRS = new Set([
  "node_modules", ".next", ".git", "dist", "build", "out", "coverage", ".vercel", ".turbo", ".cache",
]);
const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const SIGNALS = {
  auth: /getServerSession|\bauth\(\)|currentUser|withAuth|\b(?:get|require|ensure|assert|check)(?:Auth|User|Session|Admin|Staff|Role|Permission)\w*\(|verifySession|validateRequest|supabase\.auth|getToken|jwtVerify|jwt\.verify|verifyIdToken/,
  secret: /CRON_SECRET|constructEvent|createHmac|timingSafeEqual|verifySignature|svix|x-hub-signature|stripe-signature/i,
  validation: /\bzod\b|from ["']zod["']|\.safeParse\(|\.parse\(|valibot|\byup\b|\bjoi\b|superstruct|arktype/,
  ratelimit: /rate-?limit/i,
};
const RISK_SINKS = {
  "raw-sql": /\$queryRawUnsafe|\$executeRawUnsafe|\.unsafe\(|\bsql\.raw\(|knex\.raw\(/,
  "shell": /child_process|\bexecSync\(|(?<![.\w])exec\(|(?<![.\w])spawn\(/,
  "user-url-fetch": /fetch\(\s*(?!["'`])[a-zA-Z_$][\w$.]*\s*[,)]/,
  "redirect-var": /redirect\(\s*(?!["'`])[a-zA-Z_$][\w$.]*\s*[,)]/,
  "fs": /from ["'](node:)?fs(\/promises)?["']|require\(["'](node:)?fs["']\)/,
  "html-sink": /dangerouslySetInnerHTML|innerHTML\s*=/,
  "decode-only-jwt": /jwt\.decode\(|decodeJwt\(/,
};

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
    } else if (CODE_EXT.test(e.name)) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

const rel = (f) => path.relative(root, f).split(path.sep).join("/");
const read = (f) => {
  try {
    return fs.readFileSync(f, "utf8");
  } catch {
    return "";
  }
};
const lineOf = (src, index) => src.slice(0, index).split("\n").length;

function signalsFor(src) {
  const found = Object.entries(SIGNALS).filter(([, re]) => re.test(src)).map(([k]) => k);
  const sinks = Object.entries(RISK_SINKS).filter(([, re]) => re.test(src)).map(([k]) => k);
  const runtime = /export\s+const\s+runtime\s*=\s*["']edge["']/.test(src) ? "edge" : null;
  return { found, sinks, runtime };
}

function urlFromAppFile(relFile) {
  const m = /(?:^|\/)app\/(.*)\/?route\.[a-z]+$/.exec(relFile) ?? /(?:^|\/)app\/()route\.[a-z]+$/.exec(relFile);
  if (!m) return null;
  const segs = m[1].split("/").filter((s) => s && !/^\(.*\)$/.test(s) && !s.startsWith("@"));
  return "/" + segs.join("/");
}

function urlFromPagesFile(relFile) {
  const m = /(?:^|\/)pages\/(api\/.*)\.[a-z]+$/.exec(relFile);
  if (!m) return null;
  return "/" + m[1].replace(/\/index$/, "");
}

function methodsOf(src) {
  const set = new Set();
  for (const m of HTTP_METHODS) {
    const re = new RegExp(
      `export\\s+(?:async\\s+)?function\\s+${m}\\b|export\\s+(?:const|let|var)\\s+${m}\\b|\\bas\\s+${m}\\b|export\\s*\\{[^}]*\\b${m}\\b`,
    );
    if (re.test(src)) set.add(m);
  }
  return [...set];
}

function serverActions(src, relFile) {
  const actions = [];
  const fileLevel = /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use server["']/.test(src);
  if (fileLevel) {
    const re = /export\s+(?:default\s+)?(?:async\s+)?(?:function\s+([\w$]+)|const\s+([\w$]+)\s*=)/g;
    let m;
    while ((m = re.exec(src))) {
      actions.push({ name: m[1] ?? m[2], file: relFile, line: lineOf(src, m.index) });
    }
  } else {
    const re = /["']use server["']/g;
    let m;
    while ((m = re.exec(src))) {
      actions.push({ name: "(inline action)", file: relFile, line: lineOf(src, m.index) });
    }
  }
  return actions;
}

// Does a function body mention an auth signal? Approximated by the text between this
// export and the next one.
function sliceFrom(src, line) {
  const lines = src.split("\n");
  const rest = lines.slice(line - 1);
  const next = rest.slice(1).findIndex((l) => /^export\s/.test(l));
  return (next === -1 ? rest : rest.slice(0, next + 1)).join("\n");
}

function parseMatchers(src) {
  const m = /matcher\s*:\s*(\[[\s\S]*?\]|["'`][^"'`]*["'`])/.exec(src);
  if (!m) return null;
  return [...m[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((x) => x[1]);
}

function coveredBy(matchers, url) {
  if (matchers === null) return "all"; // no matcher: runs on every request
  let unknown = false;
  for (const pat of matchers) {
    if (/[(\\]/.test(pat)) {
      unknown = true;
      continue;
    }
    const prefix = pat.replace(/\/:[^/]+[*+?]?$/, "").replace(/\/\*$/, "");
    if (url === prefix || url.startsWith(prefix.endsWith("/") ? prefix : prefix + "/") || pat === url) return "yes";
  }
  return unknown ? "?" : "no";
}

const files = walk(root);
const routes = [];
const actions = [];
let middleware = null;

for (const f of files) {
  const r = rel(f);
  const src = read(f);

  if (/(^|\/)(src\/)?(middleware|proxy)\.(ts|js|mjs)$/.test(r) && !middleware) {
    middleware = { file: r, matchers: parseMatchers(src), ...signalsFor(src) };
    continue;
  }

  const url = /(^|\/)route\.[a-z]+$/.test(r) ? urlFromAppFile(r) : urlFromPagesFile(r);
  if (url) {
    const s = signalsFor(src);
    const methods = methodsOf(src);
    routes.push({
      url,
      methods: methods.length ? methods : /pages\/api\//.test(r) ? ["(handler)"] : ["?"],
      file: r,
      signals: s.found,
      sinks: s.sinks,
      runtime: s.runtime,
    });
    continue;
  }

  if (/["']use server["']/.test(src)) {
    for (const a of serverActions(src, r)) {
      const body = sliceFrom(src, a.line);
      const s = signalsFor(body);
      actions.push({ ...a, signals: s.found, sinks: s.sinks });
    }
  }
}

for (const rt of routes) {
  rt.middleware = middleware ? coveredBy(middleware.matchers, rt.url) : "none";
}

let crons = [];
const vercelJson = path.join(root, "vercel.json");
if (fs.existsSync(vercelJson)) {
  try {
    const cfg = JSON.parse(read(vercelJson));
    crons = (cfg.crons ?? []).map((c) => {
      const target = routes.find((rt) => rt.url === c.path.split("?")[0]);
      return {
        path: c.path,
        schedule: c.schedule,
        file: target?.file ?? null,
        secretCheck: target ? target.signals.includes("secret") : null,
      };
    });
  } catch {
    crons = [{ path: "(vercel.json could not be parsed)", schedule: "", file: null, secretCheck: null }];
  }
}

routes.sort((a, b) => a.url.localeCompare(b.url));

// --- beyond the entry points -----------------------------------------------------
// Things an audit also has to look at that are not reachable URLs: database policies,
// what is exposed to the browser, and a few code patterns that are wrong more often
// than not. Each hit is a place to read, with its line number.

const PATTERNS = [
  { id: "html-sink", re: /dangerouslySetInnerHTML|\.innerHTML\s*=/, note: "raw HTML rendering; check where the value comes from" },
  { id: "token-decode", re: /jwt\.decode\(|decodeJwt\(/, note: "token read without signature verification" },
  { id: "secret-fallback", re: /process\.env\.[A-Z0-9_]*(SECRET|KEY|TOKEN|PASSWORD)[A-Z0-9_]*\s*(\|\||\?\?)\s*["'`]/, note: "hardcoded fallback for a secret" },
  { id: "public-secret", re: /process\.env\.(NEXT_PUBLIC_|VITE_|PUBLIC_)[A-Z0-9_]*(SECRET|SERVICE_ROLE|PRIVATE|PASSWORD)[A-Z0-9_]*/, note: "secret-looking variable with a public prefix; it ships to the browser" },
  { id: "fast-hash", re: /createHash\(\s*["'](md5|sha1|sha256|sha512)["']\s*\)/, note: "fast digest; a problem if it hashes passwords" },
  { id: "cors-wildcard", re: /Access-Control-Allow-Origin["'\s,:a-z]*value["'\s:]*\*|Access-Control-Allow-Origin["']?\s*[:,]\s*["']\*/i, note: "wildcard CORS" },
  { id: "build-checks-off", re: /ignoreBuildErrors\s*:\s*true|ignoreDuringBuilds\s*:\s*true/, note: "type or lint errors do not fail the build" },
  { id: "raw-sql", re: RISK_SINKS["raw-sql"], note: "raw SQL API; check for interpolated input" },
  { id: "getsession-gate", re: /auth\.getSession\(\)/, note: "Supabase getSession() does not revalidate the token; fine for display, not for access decisions" },
  { id: "user-metadata", re: /user_metadata/, note: "user-editable metadata; must not carry roles or permissions" },
];

const patternHits = [];
const cookieSets = [];
let memoryLimiter = null;

for (const f of files) {
  const r = rel(f);
  const src = read(f);
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    for (const p of PATTERNS) {
      if (p.re.test(line)) patternHits.push({ id: p.id, file: r, line: i + 1, note: p.note });
    }
    if (/cookies(\(\))?\s*\.set\(|\.cookies\.set\(/.test(line)) {
      const window = lines.slice(i, i + 6).join("\n");
      cookieSets.push({ file: r, line: i + 1, httpOnly: /httpOnly\s*:\s*true/.test(window) });
    }
  });
  if (!memoryLimiter && /rate.?limit/i.test(r + src.slice(0, 2000)) && /new Map\s*[<(]/.test(src)) {
    memoryLimiter = r;
  }
}

function walkSql(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walkSql(path.join(dir, e.name), out);
    } else if (e.name.endsWith(".sql")) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

const tables = new Map(); // name -> { file, rls, openPolicies: [] }
for (const f of walkSql(root).sort()) {
  const sql = read(f).replace(/--[^\n]*/g, "");
  const name = (raw) => raw.replace(/["`]/g, "").replace(/^public\./i, "").toLowerCase();
  for (const m of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([\w."`]+)/gi)) {
    if (!tables.has(name(m[1]))) tables.set(name(m[1]), { file: rel(f), rls: false, openPolicies: [] });
  }
  // Apply ENABLE and DISABLE in statement order (files are sorted, so migration order) so the
  // reported state is the final one.
  for (const m of sql.matchAll(/alter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?([\w."`]+)\s+(enable|disable)\s+row\s+level\s+security/gi)) {
    const rls = m[2].toLowerCase() === "enable";
    const t = tables.get(name(m[1]));
    if (t) t.rls = rls;
    else tables.set(name(m[1]), { file: rel(f), rls, openPolicies: [] });
  }
  for (const m of sql.matchAll(/create\s+policy\s+("[^"]+"|\w+)\s+on\s+([\w."`]+)([^;]*);/gi)) {
    if (/(using|with\s+check)\s*\(\s*true\s*\)/i.test(m[3])) {
      const t = tables.get(name(m[2]));
      if (t) t.openPolicies.push(m[1].replace(/"/g, ""));
    }
  }
}

const result = {
  root: rel(root) || ".",
  middleware,
  routes,
  actions,
  crons,
  tables: [...tables].map(([name, t]) => ({ name, ...t })),
  patterns: patternHits,
  cookieSets,
  memoryLimiter,
};

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const cell = (list) => (list.length ? list.join(", ") : "—");
const out = [];
out.push(`# Attack surface — ${path.basename(root)}`);
out.push("");
out.push(
  "Signals are text matches, not proof. `—` under auth/validation means no familiar call was seen in that file: read it. A present signal still needs its logic checked (ownership, role, signature over the raw body).",
);
out.push("");

out.push("## Middleware / proxy");
if (!middleware) {
  out.push("None found. Every route must authenticate on its own.");
} else {
  const m = middleware.matchers;
  out.push(`- File: \`${middleware.file}\``);
  out.push(`- Matcher: ${m === null ? "none (runs on every request)" : m.map((x) => `\`${x}\``).join(", ")}`);
  out.push("- A route outside the matcher gets no middleware protection; one inside it should still check auth itself.");
}
out.push("");

out.push(`## Route handlers (${routes.length})`);
if (routes.length) {
  out.push("| URL | Methods | File | Middleware | Auth / secret | Validation | Rate limit | Review hints |");
  out.push("|---|---|---|---|---|---|---|---|");
  for (const r of routes) {
    const authish = r.signals.filter((s) => s === "auth" || s === "secret");
    const hints = [...r.sinks, ...(r.runtime ? [`runtime:${r.runtime}`] : [])];
    out.push(
      `| \`${r.url}\` | ${r.methods.join(" ")} | \`${r.file}\` | ${r.middleware} | ${cell(authish)} | ${
        r.signals.includes("validation") ? "yes" : "—"
      } | ${r.signals.includes("ratelimit") ? "yes" : "—"} | ${cell(hints)} |`,
    );
  }
} else {
  out.push("None found.");
}
out.push("");

out.push(`## Server Actions (${actions.length})`);
if (actions.length) {
  out.push("Each exported action is a public POST endpoint, whatever page imports it.");
  out.push("");
  out.push("| Action | Location | Auth | Validation | Review hints |");
  out.push("|---|---|---|---|---|");
  for (const a of actions) {
    out.push(
      `| \`${a.name}\` | \`${a.file}:${a.line}\` | ${cell(a.signals.filter((s) => s === "auth"))} | ${
        a.signals.includes("validation") ? "yes" : "—"
      } | ${cell(a.sinks)} |`,
    );
  }
} else {
  out.push("None found.");
}
out.push("");

out.push(`## Cron jobs in vercel.json (${crons.length})`);
if (crons.length) {
  out.push("| Path | Schedule | Handler | Secret check |");
  out.push("|---|---|---|---|");
  for (const c of crons) {
    out.push(
      `| \`${c.path}\` | \`${c.schedule}\` | ${c.file ? `\`${c.file}\`` : "**no matching route**"} | ${
        c.secretCheck === null ? "n/a" : c.secretCheck ? "signal present" : "—"
      } |`,
    );
  }
  const cronish = routes.filter((r) => /cron/i.test(r.url) && !crons.some((c) => c.file === r.file));
  for (const r of cronish) out.push(`- \`${r.url}\` looks like a cron route but is not scheduled in vercel.json.`);
} else {
  const cronish = routes.filter((r) => /cron/i.test(r.url));
  out.push(cronish.length ? cronish.map((r) => `- \`${r.url}\` looks like a cron route; no vercel.json schedule found.`).join("\n") : "None found.");
}
out.push("");

out.push(`## Database tables in SQL files (${tables.size})`);
if (tables.size) {
  out.push("A table in an exposed schema without row level security can be read and written with the public anon key, whatever the app's routes do. Policies set only in a dashboard are not visible here.");
  out.push("");
  out.push("| Table | Defined in | RLS enabled | Policies that are always true |");
  out.push("|---|---|---|---|");
  for (const [name, t] of tables) {
    out.push(`| \`${name}\` | \`${t.file}\` | ${t.rls ? "yes" : "**no**"} | ${t.openPolicies.length ? t.openPolicies.map((p) => `\`${p}\``).join(", ") : "—"} |`);
  }
} else {
  out.push("No SQL files with table definitions found. If the project uses Supabase or another exposed database API, its policies need checking where they live.");
}
out.push("");

out.push("## Patterns worth a look");
const extra = [];
for (const c of cookieSets.filter((c) => !c.httpOnly)) {
  extra.push({ id: "cookie-flags", file: c.file, line: c.line, note: "cookie set with no httpOnly flag nearby; check all flags if this is a session cookie" });
}
if (memoryLimiter) extra.push({ id: "memory-rate-limit", file: memoryLimiter, line: 1, note: "rate limit state held in process memory; ineffective across serverless instances" });
const allHits = [...patternHits, ...extra];
if (allHits.length) {
  out.push("Text matches outside or inside entry points. Each is a place to read, not a verdict.");
  out.push("");
  for (const h of allHits) out.push(`- \`${h.file}:${h.line}\` — ${h.id}: ${h.note}`);
} else {
  out.push("None of the known patterns matched.");
}
out.push("");

const unauthRoutes = routes.filter((r) => !r.signals.includes("auth") && !r.signals.includes("secret"));
const unauthActions = actions.filter((a) => !a.signals.includes("auth"));
out.push("## Read these first");
out.push(
  `${unauthRoutes.length} of ${routes.length} route files and ${unauthActions.length} of ${actions.length} actions show no auth or secret signal. Some are meant to be public; confirm each one.`,
);
for (const r of unauthRoutes) out.push(`- \`${r.methods.join(" ")} ${r.url}\` — \`${r.file}\``);
for (const a of unauthActions) out.push(`- action \`${a.name}\` — \`${a.file}:${a.line}\``);

console.log(out.join("\n"));
