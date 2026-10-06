import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const sort = new URL(req.url).searchParams.get("sort") ?? "name";
  const products = await getDb().$queryRawUnsafe(`SELECT * FROM "Product" ORDER BY ${sort}`);
  return NextResponse.json(products);
}
