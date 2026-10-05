import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to") ?? "/dashboard";
  if (!to.startsWith("/")) return NextResponse.redirect(new URL("/dashboard", url));
  return NextResponse.redirect(new URL(to, url));
}
