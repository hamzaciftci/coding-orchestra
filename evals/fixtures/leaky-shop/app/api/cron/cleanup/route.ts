import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await getDb().order.deleteMany({ where: { status: "pending", createdAt: { lt: cutoff } } });
  return NextResponse.json({ deleted: result.count });
}
