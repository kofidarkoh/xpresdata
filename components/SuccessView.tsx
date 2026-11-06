"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "./Header";
import WhatsAppIcon from "./WhatsAppIcon";
import { formatVolume, ghs } from "@/data/bundles";

interface LastOrder {
  reference?: string;
  bundleId?: string;
  network?: string;
  volumeMB?: number;
  phone?: string;
  amountGHS?: number;
}

function readLastOrder(): LastOrder | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("xpresdata:lastOrder");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastOrder;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function Inner() {
  const params = useSearchParams();
  const urlReference = params.get("reference") ?? params.get("trxref") ?? "";
  const [order] = useState<LastOrder | null>(readLastOrder);

  const reference = urlReference || order?.reference || "";
  const bundleLabel = order?.bundleId
    ? `${order.network ?? bundleIdNetwork(order.bundleId)} ${order.volumeMB ? formatVolume(order.volumeMB) : order.bundleId}`
    : null;

  const amountLabel =
    typeof order?.amountGHS === "number" ? ghs(order.amountGHS) : null;

  const onCopy = () => {
    if (reference) navigator.clipboard?.writeText(reference);
  };

  return (
    <div className="container">
      <Header />
      <div className="page-card">
        <div className="success-icon">✓</div>
        <h1>Payment successful!</h1>
        <p>
          Thank you. Your data is being sent and should arrive within 30
          seconds to 5 minutes. Keep your Paystack receipt just in case.
        </p>

        {reference && (
          <div className="order-row">
            <span>Order reference</span>
            <b>{reference}</b>
          </div>
        )}
        {bundleLabel && (
          <div className="order-row">
            <span>Bundle</span>
            <b>{bundleLabel}</b>
          </div>
        )}
        {order?.phone && (
          <div className="order-row">
            <span>Phone</span>
            <b>{order.phone}</b>
          </div>
        )}
        {amountLabel && (
          <div className="order-row">
            <span>Amount</span>
            <b>{amountLabel}</b>
          </div>
        )}

        <div className="btn-row">
          <Link href="/" className="btn">
            Back to bundles
          </Link>
          <span className="btn secondary fake-icon" aria-label="Contact us" role="img">
            <WhatsAppIcon size={15} />
          </span>
          <Link href="/track-order" className="btn secondary">
            Track order
          </Link>
          {reference && (
            <button type="button" className="btn secondary" onClick={onCopy}>
              Copy receipt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function bundleIdNetwork(id: string) {
  return id.split("-")[0]?.toUpperCase() ?? id;
}

export default function SuccessView() {
  return (
    <Suspense
      fallback={
        <div className="container">
          <Header />
          <div className="page-card">
            <div className="success-icon">✓</div>
            <h1>Payment successful!</h1>
            <p>Thank you. Your data is being sent.</p>
          </div>
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}
