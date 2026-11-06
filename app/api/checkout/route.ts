import { NextResponse } from "next/server";
import { getBundle } from "@/data/bundles";
import { createOrder } from "@/lib/orders";
import { initializeTransaction, paystackConfigured } from "@/lib/paystack";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { bundleId?: string; phone?: string };
    const bundleId = String(body.bundleId ?? "");
    const phone = String(body.phone ?? "").replace(/\D/g, "");

    const bundle = getBundle(bundleId);
    if (!bundle) return NextResponse.json({ error: "Invalid bundle" }, { status: 400 });
    if (phone.length !== 10) {
      return NextResponse.json({ error: "Phone number must be 10 digits" }, { status: 400 });
    }

    if (!paystackConfigured()) {
      return NextResponse.json(
        { error: "Paystack is not configured. Set PAYSTACK_SECRET_KEY in .env.local (see .env.example)." },
        { status: 500 }
      );
    }

    const amountPesewas = Math.round(bundle.priceGHS * 100);
    const reference = `EXP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const origin = new URL(req.url).origin;
    const callbackUrl = `${origin}/success?reference=${encodeURIComponent(reference)}`;
    const email = `${phone}@xpresdata.com`;

    const init = await initializeTransaction({
      amountPesewas,
      email,
      reference,
      callbackUrl,
      metadata: { bundleId: bundle.id, phone, site: "XpresData" },
    });

    createOrder({
      reference,
      bundleId: bundle.id,
      phone,
      amountGHS: bundle.priceGHS,
      amountPesewas,
      status: "pending",
      paystackReference: init.reference,
      authorizationUrl: init.authorization_url,
    });

    return NextResponse.json({
      authorization_url: init.authorization_url,
      access_code: init.access_code,
      reference,
    });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
