#!/usr/bin/env node
// Post-deploy smoke check. Sends GET requests only, no dependencies (Node 18+).
//
//   node smoke.mjs <base-url> [path ...] [--timeout ms] [--json]
//   node smoke.mjs https://staging.example.com / /login /api/health
//
// A path may carry an expected status: /dashboard=307 (default: any 2xx).
// The leading slash is optional. In Git Bash on Windows leave it out (login, api/health),
// because MSYS rewrites arguments that start with "/" into Windows paths.
// Also reports which security headers the first path returns.
// Exit code 1 if any check fails.

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args.splice(i, 2)[1];
};
const timeout = Number(flag("--timeout") ?? 10000);
const asJson = args.includes("--json") && args.splice(args.indexOf("--json"), 1).length > 0;

const [base, ...rest] = args;
if (!base || !/^https?:\/\//.test(base)) {
  console.error("usage: node smoke.mjs <base-url> [path[=status] ...] [--timeout ms] [--json]");
  process.exit(2);
}
const checks = (rest.length ? rest : [""]).map((p) => {
  const [raw, expected] = p.split("=");
  if (/^[A-Za-z]:[\/]/.test(raw)) {
    console.error(`"${raw}" looks like a path rewritten by Git Bash. Pass it without the leading slash.`);
    process.exit(2);
  }
  const pathname = raw.startsWith("/") ? raw : `/${raw}`;
  return { path: pathname, expected: expected ? Number(expected) : null };
});

const SECURITY_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
];

const results = [];
let headerReport = null;

for (const check of checks) {
  const url = new URL(check.path, base).toString();
  const started = Date.now();
  try {
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(timeout) });
    const ms = Date.now() - started;
    const ok = check.expected ? res.status === check.expected : res.status >= 200 && res.status < 300;
    results.push({ path: check.path, status: res.status, ms, ok, location: res.headers.get("location") });
    if (!headerReport) {
      headerReport = Object.fromEntries(SECURITY_HEADERS.map((h) => [h, res.headers.has(h)]));
      const csp = res.headers.get("content-security-policy") ?? "";
      if (/frame-ancestors/.test(csp)) headerReport["x-frame-options"] = true;
    }
    await res.body?.cancel();
  } catch (err) {
    results.push({ path: check.path, status: null, ms: Date.now() - started, ok: false, error: err.name === "TimeoutError" ? `timeout after ${timeout}ms` : String(err.cause?.code ?? err.message) });
  }
}

const failed = results.filter((r) => !r.ok);

if (asJson) {
  console.log(JSON.stringify({ base, results, securityHeaders: headerReport, failed: failed.length }, null, 2));
} else {
  console.log(`Smoke check — ${base}`);
  for (const r of results) {
    const detail = r.error ?? `${r.status}${r.location ? ` -> ${r.location}` : ""}`;
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.path.padEnd(28)} ${detail}  (${r.ms}ms)`);
  }
  if (headerReport) {
    const missing = Object.entries(headerReport).filter(([, present]) => !present).map(([h]) => h);
    console.log(`Security headers on ${checks[0].path}: ${missing.length ? `missing ${missing.join(", ")}` : "all present"}`);
  }
  console.log(failed.length ? `${failed.length} of ${results.length} checks failed` : `All ${results.length} checks passed`);
}

process.exit(failed.length ? 1 : 0);
