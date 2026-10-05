#!/usr/bin/env node
// Copy helper scripts from the English skills (the source of truth) into the Turkish
// ones. Scripts are language-neutral and must stay byte-identical; validate.mjs checks it.
import fs from "node:fs";
import path from "node:path";
import { repoRoot, SKILL_ROOTS, listSkills } from "./lib.mjs";

let copied = 0;
for (const name of listSkills(SKILL_ROOTS.en)) {
  const from = path.join(repoRoot, SKILL_ROOTS.en, name, "scripts");
  if (!fs.existsSync(from)) continue;
  const to = path.join(repoRoot, SKILL_ROOTS.tr, name, "scripts");
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) {
    fs.copyFileSync(path.join(from, f), path.join(to, f));
    copied++;
  }
}
console.log(`synced ${copied} script(s) to ${SKILL_ROOTS.tr}`);
