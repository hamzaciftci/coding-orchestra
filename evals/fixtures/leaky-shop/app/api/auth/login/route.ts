import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getDb } from "@/lib/db";
import { signSession } from "@/lib/auth";
import { allow } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!allow(email)) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const user = await getDb().user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "No account with this email" }, { status: 404 });

  const hash = createHash("sha256").update(password).digest("hex");
  if (hash !== user.passwordHash) return NextResponse.json({ error: "Wrong password" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", signSession({ userId: user.id, role: user.role as "user" | "admin" }));
  return res;
}
