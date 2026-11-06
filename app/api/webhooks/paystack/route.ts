import { NextResponse } from "next/server";
import crypto from "crypto";
import { getOrder, updateOrder } from "@/lib/orders";
import { verifyTransaction } from "@/lib/paystack";

// Paystack webhook — configure in Paystack Dashboard → Settings → Webhooks
// URL: https://your-domain/api/webhooks/paystack
// Secret: stored in PAYSTACK_WEBHOOK_SECRET (if set)
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET ?? "";

  if (webhookSecret) {
    const hash = crypto.createHmac("sha512", webhookSecret).update(rawBody).digest("hex");
    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
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
    if (order) {
      try {
        const v = await verifyTransaction(reference);
        if (v.status === "success") {
          updateOrder(reference, { status: "paid" });
          // TODO: trigger fulfillment here (data API / manual queue)
        } else {
          updateOrder(reference, { status: "failed" });
        }
      } catch {
        updateOrder(reference, { status: "paid" });
      }
    }
  }

  return NextResponse.json({ received: true });
}
