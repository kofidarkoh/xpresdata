"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "./Header";
import { whatsappUrl } from "@/data/config";

interface Order {
  reference: string;
  bundleId: string;
  phone: string;
  amountGHS: number;
  status: string;
}

function Inner() {
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref") ?? "";
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"verifying" | "done" | "missing">(
    () => (reference ? "verifying" : "missing")
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/verify?reference=${encodeURIComponent(reference)}`);
        const data = (await res.json()) as { order?: Order; error?: string };
        if (cancelled) return;
        if (!res.ok || !data.order) {
          setError(data.error ?? "Could not verify payment.");
          setState("done");
          return;
        }
        setOrder(data.order);
        setState("done");
      } catch {
        if (!cancelled) {
          setError("Could not verify payment. Try tracking your order with your phone number.");
          setState("done");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [reference]);

  return (
    <div className="container">
      <Header />
      <div className="page-card">
        {state === "verifying" && (
          <>
            <div className="success-icon">◌</div>
            <h1>Verifying payment…</h1>
            <p>Please wait a moment while we confirm your payment with Paystack.</p>
          </>
        )}

        {state === "missing" && (
          <>
            <h1>No payment reference found</h1>
            <p>You came back without a payment reference. If you paid, track your order with your phone number.</p>
            <div className="btn-row">
              <Link href="/track-order" className="btn">Track order</Link>
              <Link href="/" className="btn secondary">Back to bundles</Link>
            </div>
          </>
        )}

        {state === "done" && order && (
          <>
            <div className="success-icon">✓</div>
            <h1>Payment successful!</h1>
            <p>Your data is being sent. You should receive it within 30 seconds to 5 minutes.</p>
            <div className="order-row"><span>Order reference</span><b>{order.reference}</b></div>
            <div className="order-row"><span>Bundle</span><b>{order.bundleId}</b></div>
            <div className="order-row"><span>Phone</span><b>{order.phone}</b></div>
            <div className="order-row"><span>Amount</span><b>GHS {order.amountGHS.toFixed(2)}</b></div>
            <div className="order-row">
              <span>Status</span>
              <span className={`status-pill status-${order.status}`}>{order.status}</span>
            </div>
            <div className="btn-row">
              <Link href="/track-order" className="btn">Track order</Link>
              <button type="button" className="btn secondary" onClick={() => navigator.clipboard?.writeText(order.reference)}>
                Copy receipt
              </button>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn secondary">
                WhatsApp support
              </a>
            </div>
          </>
        )}

        {state === "done" && !order && (
          <>
            <h1>Couldn’t verify payment</h1>
            <p>{error} If money was deducted, keep your Paystack receipt and contact support.</p>
            <div className="btn-row">
              <Link href="/track-order" className="btn">Track order</Link>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn secondary">
                WhatsApp support
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessView() {
  return (
    <Suspense fallback={<div className="container"><Header /><div className="page-card"><p>Loading…</p></div></div>}>
      <Inner />
    </Suspense>
  );
}
