import fs from "node:fs";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await getDb().order.findMany({ where: { userId: session.userId } });
  const file = `/tmp/export-${session.userId}.json`;
  fs.writeFileSync(file, JSON.stringify(orders));

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.MAIL_FROM!,
    to: "ops@example.com",
    subject: "Export ready",
    text: file,
  });
  return NextResponse.json({ ok: true });
}
