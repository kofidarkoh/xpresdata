import { NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/orders";
import { verifyTransaction, paystackConfigured } from "@/lib/paystack";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference") ?? "";
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  const order = getOrder(reference);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.status === "paid" || order.status === "delivered") {
    return NextResponse.json({ order });
  }

  if (!paystackConfigured()) {
    return NextResponse.json({ error: "Paystack is not configured" }, { status: 500 });
  }

  try {
    const v = await verifyTransaction(reference);
    if (v.status === "success") {
      // Amount match guard
      if (v.amount !== order.amountPesewas) {
        console.warn(`[verify] amount mismatch ref=${reference} expected=${order.amountPesewas} got=${v.amount}`);
      }
      const updated = updateOrder(reference, { status: "paid", paystackReference: v.reference });
      // TODO: picks up fulfillment (data API / manual) — for now mark paid; webhook/manual can set delivered
      return NextResponse.json({ order: updated });
    }
    updateOrder(reference, { status: "failed" });
    return NextResponse.json({ error: `Payment status: ${v.status}` }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verification failed" },
      { status: 500 }
    );
  }
}
