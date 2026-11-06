import { NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/orders";
import { verifyTransaction, paystackConfigured } from "@/lib/paystack";
import { getBundle } from "@/data/bundles";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference") ?? "";
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  const order = getOrder(reference);

  if (order && (order.status === "paid" || order.status === "delivered")) {
    return NextResponse.json({ order });
  }

  if (!paystackConfigured()) {
    return NextResponse.json({ error: "Paystack is not configured" }, { status: 500 });
  }

  try {
    const v = await verifyTransaction(reference);
    if (v.status === "success") {
      // Strict amount + currency guards when we know the local order
      if (order) {
        if (v.amount !== order.amountPesewas) {
          console.warn(`[verify] amount mismatch ref=${reference} expected=${order.amountPesewas} got=${v.amount}`);
          return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
        }
        if (v.currency && v.currency !== "GHS") {
          return NextResponse.json({ error: "Currency mismatch" }, { status: 400 });
        }
        const updated = updateOrder(reference, { status: "paid", paystackReference: v.reference });
        // TODO: picks up fulfillment (data API / manual) — for now mark paid; webhook/manual can set delivered
        return NextResponse.json({ order: updated });
      }
      // Fallback for Vercel serverless (in-memory store lost): verify directly
      // with Paystack and reconstruct a lightweight response from metadata.
      const meta = (v.metadata ?? {}) as { bundleId?: string; phone?: string };
      const bundle = meta.bundleId ? getBundle(String(meta.bundleId)) : undefined;
      return NextResponse.json({
        order: {
          reference,
          bundleId: meta.bundleId ?? bundle?.id ?? "unknown",
          phone: meta.phone ?? "",
          amountGHS: v.amount / 100,
          amountPesewas: v.amount,
          status: "paid",
          paystackReference: v.reference,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          note: "Recovered from Paystack (local store is in-memory; use a DB for persistence)",
        },
      });
    }
    if (order) updateOrder(reference, { status: "failed" });
    return NextResponse.json({ error: `Payment status: ${v.status}` }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verification failed" },
      { status: 500 }
    );
  }
}
