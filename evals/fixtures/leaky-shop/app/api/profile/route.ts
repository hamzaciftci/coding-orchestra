import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  try {
    const user = await getDb().user.update({ where: { id: session.userId }, data: body });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: String(err), stack: (err as Error).stack }, { status: 500 });
  }
}
