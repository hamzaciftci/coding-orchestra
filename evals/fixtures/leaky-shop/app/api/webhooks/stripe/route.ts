import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const event = await req.json();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const db = getDb();
    await db.order.update({ where: { id: session.metadata.orderId }, data: { status: "paid", stripeId: session.id } });
    await db.user.update({
      where: { id: session.metadata.userId },
      data: { credit: { increment: session.amount_total / 100 } },
    });
  }
  return NextResponse.json({ received: true });
}
