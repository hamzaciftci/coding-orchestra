import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const target = new URL(req.url).searchParams.get("url");
  if (!target) return NextResponse.json({ error: "url required" }, { status: 400 });
  const html = await (await fetch(target)).text();
  const title = /<title>(.*?)<\/title>/i.exec(html)?.[1] ?? null;
  return NextResponse.json({ title });
}
