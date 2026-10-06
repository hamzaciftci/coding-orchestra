import { NextResponse } from "next/server";
import { requireStaff, supabaseServer } from "@/lib/supabase-server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireStaff())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const supabase = await supabaseServer();
  await supabase.from("invoices").delete().eq("id", id);
  return new NextResponse(null, { status: 204 });
}
