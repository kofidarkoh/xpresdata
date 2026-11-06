import { NextResponse } from "next/server";
import crypto from "crypto";
import { getOrder, updateOrder } from "@/lib/orders";
import { verifyTransaction } from "@/lib/paystack";

// Paystack webhook — configure in Paystack Dashboard → Settings → Webhooks
// URL: https://your-domain/api/webhooks/paystack
// Paystack signs with PAYSTACK_SECRET_KEY (PAYSTACK_WEBHOOK_SECRET optional override).
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY || "";

  if (!secret || !signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  let valid = false;
  try {
    valid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    valid = false;
  }
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; status?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reference = event.data?.reference;
  if (event.event === "charge.success" && reference) {
    const order = getOrder(reference);
    if (order && order.status !== "paid" && order.status !== "delivered") {
      try {
        const v = await verifyTransaction(reference);
        if (v.status === "success") {
          // Strict amount/currency check — do not mark paid on mismatch
          if (v.amount === order.amountPesewas && (!v.currency || v.currency === "GHS")) {
            updateOrder(reference, { status: "paid" });
          } else {
            updateOrder(reference, { status: "failed" });
          }
          // TODO: trigger fulfillment here (data API / manual queue)
        } else {
          updateOrder(reference, { status: "failed" });
        }
      } catch (err) {
        // Never mark paid without a successful verification
        console.error("[webhook]", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
