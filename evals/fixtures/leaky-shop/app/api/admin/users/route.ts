import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Internal admin tooling. The URL is not linked from anywhere in the UI.
export async function GET() {
  return NextResponse.json(await getDb().user.findMany());
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await getDb().user.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
