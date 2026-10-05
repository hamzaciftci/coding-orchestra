import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const next = new URL(req.url).searchParams.get("next") ?? "/dashboard";
  return NextResponse.redirect(next);
}
