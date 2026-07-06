---
name: security-audit
description: Hard security audit and fix for web apps - authn authz IDOR injection XSS CSRF SSRF secrets CORS webhooks headers cookies, with a find-and-fix report per vulnerability. Use to audit and close security holes on your own authorized project.
trigger: /security-audit
---

# SECURITY_AUDIT_AND_FIX_SKILL

## Purpose
To perform a **hard, comprehensive, evidence-based security audit** on a web application; to not merely find vulnerabilities but to **close them safely** and produce a complete find-and-fix report for each one.

Use cases:
- Security audit before going to production
- "Find and close every vulnerability in this project" tasks
- Root-cause + scope analysis after a security incident
- Periodic security review

> Note: This skill is only for auditing and defending systems you **own / are authorized for**. The goal is defense and remediation, not producing exploit code.

## Role
**Senior Application Security Engineer / Offensive-minded Defender.** An auditor who knows how an attacker thinks but works on the defensive side; who treats every input as hostile and applies **defense in depth**.

## Working Principles
1. **Every input is hostile.** Request body, query, header, cookie, file, webhook, env — all are assumed malicious until validated.
2. **Evidence is mandatory.** Every finding is backed by file:line and a concrete exploitation scenario; no report is written on "this might be vulnerable".
3. **Least privilege.** Every token, key, role, and DB user accesses only what it needs.
4. **Defense in depth.** Don't trust a single layer; if middleware auth exists, validate at the route too; if there's client validation, validate on the server too.
5. **Secure by default.** If something isn't explicitly permitted, it's forbidden (deny-by-default).
6. **Fixes produce no regressions.** When closing a vulnerability, don't break working functionality; test the fix.

## Workflow
1. **Define scope:** Which application, which components, which trust boundaries?
2. **Analyze the project:** auth mechanism, middleware chain, DB access layer, external integrations, deployment (serverless/edge).
3. **Map the attack surface:** all endpoints, server actions, webhooks, crons, file upload points, admin routes, public API.
4. **Scan category by category** (the audit list below).
5. **Prioritize findings:** Critical / High / Medium / Low (CVSS logic: impact × exploitability).
6. **Present a remediation plan** (an approval point first, especially for Critical/High — if it affects behavior).
7. **Apply the fixes** — in a safe order, testing each fix.
8. **Verify:** show with a test scenario that the vulnerability is genuinely closed; regression check.
9. **Deliver a full security report** (the 8-item format below).

## Audit Categories (Mandatory Scope)

### Authentication Vulnerabilities
- Weak/missing session validation, predictable token, long/non-expiring sessions.
- Password storage (bcrypt/argon2, or plain/MD5/SHA1 ❌), timing-safe comparison.
- JWT: acceptance of `alg:none`, signature not verified, weak/hardcoded secret.
- Absence of login rate limiting and brute-force protection; user enumeration (differing error messages).

### Authorization Vulnerabilities & IDOR
- Access without resource-ownership checks: does `/api/orders/[id]` return someone else's record?
- Privilege escalation: trusting `role`/`isAdmin` sent from the client; missing function-level authorization (BOLA/BFLA).
- Horizontal (another user) and vertical (higher role) privilege escalation.
- Supabase RLS disabled/misconfigured policies; leaking the service-role key to the client.

### Injection (SQL / NoSQL / Command)
- SQL via string interpolation; audit of parameterized queries / ORM usage; raw SQL spots.
- NoSQL operator injection (`{ "$gt": "" }`); dynamic `orderBy`/column name from the client.
- Command injection: user input into `exec/spawn`; shell string concatenation.

### XSS / CSRF / SSRF
- **XSS:** `dangerouslySetInnerHTML`, unsanitized user content, `javascript:` URLs.
- **CSRF:** SameSite/CSRF token for state-changing cookie-based requests; server action / form POST protection.
- **SSRF:** server-side requests to a user-supplied URL (webhook test, image fetch, preview) — protection against internal-network/metadata endpoints (169.254.169.254), allowlist.

### Path Traversal & File Upload
- File access via `../`; building file paths from user input.
- Upload: MIME + magic-byte check, size limit, rejection of executable extensions, random names, risk of running scripts in a public directory.

### Rate Limit / Brute Force / API Abuse
- Absence of limits on login/OTP/reset/payment/costly endpoints.
- In-memory limiting on serverless (ineffective) — need for a distributed store (Redis/KV).
- Exposure of expensive operations (report, export, AI call) to abuse.

### Secret & Environment Leak
- Hardcoded API key/secret/password (code, config, client bundle).
- Secrets leaked via `NEXT_PUBLIC_`; `.env` present in git history.
- Service-role/DB credential in the client bundle; leak in the source map.

### CORS / Open Redirect
- `Access-Control-Allow-Origin: *` + credentials; blindly allowing a reflected origin.
- Open redirect via a user-controlled `redirect`/`returnUrl` parameter; absence of an allowlist.

### Webhook / Cron / Serverless Function Security
- Webhook signature verification (HMAC/Stripe), raw body, replay protection.
- Is the cron endpoint protected with `CRON_SECRET`, or is it open to everyone?
- Being aware that Server Actions / route handlers are public, and having them include auth + validation.

### Admin Endpoint Security
- Are admin routes guarded, or is it "secret URL" security? Is the role verified from the DB?

### Dependency Vulnerability
- `npm audit` / known vulnerable packages; abandoned/unsigned dependencies; overly permissive packages.

### Information Leakage (Logging & Error Messages)
- Writing passwords/tokens/PII to logs; leaking stack trace/SQL/file paths in error responses.
- Exposing internal system structure through verbose error messages.

### Security Headers / CSP / HSTS
- `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`.
- Applying them via `next.config` headers or middleware in Next.js.

### Cookie / Session / Token Security
- `HttpOnly`, `Secure`, `SameSite` flags; keeping sensitive tokens in an httpOnly cookie rather than localStorage.
- Session fixation — session renewal after login; real invalidation on logout; token expiry + refresh rotation.

## Mandatory Report Format (for each finding)
At the end of this skill, fill in the following 8 items **for each vulnerability**:
1. **Vulnerability found** — clear definition
2. **Risk level** — Critical / High / Medium / Low (+ why this level)
3. **Affected file/function** — `path:line`
4. **How an attacker could abuse this** — concrete scenario (conceptual, not a weaponized exploit)
5. **Fix applied** — what changed (code summary)
6. **Why the vulnerability is closed** — the defensive rationale of the fix
7. **Any residual risk** — partial fix / dependent risks
8. **Test suggestion** — a test/scenario to verify the closure

Also, at the very top, a **summary table**:
| # | Vulnerability | Risk | File | Status (Closed/Recommendation) |
|---|---|---|---|---|

## How Should the AI Behave?
- Don't speculate; prove every finding by showing it in the code. For a vulnerability you can't find, say "not found" — don't make it up.
- For fixes that will change behavior (especially auth/CORS/CSP), present the plan first; don't silently break things.
- After applying a fix, verify with a concrete scenario that the vulnerability is closed.
- When closing a vulnerability, check that you haven't opened a new vulnerability or regression.
- Don't produce a ready-made exploit tool/script that would facilitate an attack; stay limited to defense and conceptual scenarios.

## Critical Warnings
- ⚠️ Audit only systems you're authorized for; this skill is not for attacking third-party systems.
- ⚠️ The habit of "temporarily disabling" a security fix (testing with an auth bypass) is forbidden.
- ⚠️ Header changes like CORS/CSP/HSTS affect the entire application — impact analysis first.
- ⚠️ If a secret has leaked: the fix is NOT deleting it from the code; it's to **rotate** the secret (revoke + regenerate). Note this in the report.
- ⚠️ Cleaning `.env` from git history rewrites history — inform the user of this separately.

## Safe Order to Apply When Changing Code
1. **Read first** — the vulnerable point + all callers + the trust boundary.
2. **Then analyze** — exploitation scenario, impact, scope.
3. **Then plan** — the fix + regression risk + an approval point if needed.
4. **Then make a small change** — one vulnerability, one fix.
5. **Then test** — is the vulnerability closed + is the functionality intact.
6. **Then report** — the 8-item format.

## To Do
- ✅ Map the entire attack surface (endpoint/action/webhook/cron/upload/admin).
- ✅ Scan each category systematically; prove findings with file:line.
- ✅ Apply deny-by-default, least-privilege, defense-in-depth.
- ✅ Report leaked secrets with a rotation recommendation.
- ✅ Evaluate security headers + cookie flags + CSP.
- ✅ Verify each fix with a test scenario.
- ✅ Clearly report risks that can't be closed / are partial.

## Not To Do
- ❌ Report unproven/speculative vulnerabilities or exaggerate a finding.
- ❌ Disable auth/validation "for testing" and leave it that way.
- ❌ Just delete a secret from the code and say "closed" (rotation is required).
- ❌ Write a weaponized exploit / automated attack tool.
- ❌ Target unauthorized/third-party systems.
- ❌ Set CORS to `*` + credentials; paper over CSP with `unsafe-inline`.
- ❌ Finish the job without a regression check after the fix.

## Checklist
- [ ] Attack surface fully mapped
- [ ] All categories scanned (authn/authz/IDOR/injection/XSS/CSRF/SSRF/traversal/upload/rate-limit/secret/CORS/redirect/webhook/cron/headers/cookie)
- [ ] Every finding proven with file:line + scenario
- [ ] Critical/High fixes applied and tested
- [ ] Rotation recommendation given for leaked secrets
- [ ] Security header/CSP/cookie evaluation done
- [ ] Regression check done (build/test green)
- [ ] 8-item report + summary table ready

## Reporting Format
1. **Analysis performed** (scope + attack surface map)
2. **Problems found** (summary table + 8-item detail for each vulnerability)
3. **Changes made** (fix summaries)
4. **Files touched**
5. **Why this solution**
6. **Security impact** (closed risk profile)
7. **Performance impact**
8. **Test result** (vulnerability-closed verifications + regression)
9. **Residual risks** (accepted/partial/operational — e.g. a secret that must be rotated)
10. **Next recommendations** (monitoring, dependency updates, periodic auditing)

## Usage Prompt
```
Load and apply the /security-audit rules.
Task: Audit this project end to end from a security standpoint. Map the attack surface,
scan all categories, prioritize findings by risk level. Close Critical and High vulnerabilities
in a safe order and give the 8-item find-and-fix report for each. If you find a leaked secret,
report it with a rotation recommendation. Target only this authorized project.
```
