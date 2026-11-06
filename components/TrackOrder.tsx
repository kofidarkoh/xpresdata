"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "./Header";

interface TrackedOrder {
  reference: string;
  bundleId: string;
  phone: string;
  amountGHS: number;
  status: string;
  createdAt: string;
}

export default function TrackOrder() {
  const [value, setValue] = useState("");
  const [results, setResults] = useState<TrackedOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(v)}`);
      const data = (await res.json()) as { orders?: TrackedOrder[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Not found");
      setResults(data.orders ?? []);
      if ((data.orders ?? []).length === 0) setError("No orders found. Check the number or order reference.");
    } catch {
      setError("No orders found. Check the number or order reference.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <Header />
      <div className="page-card">
        <h1>Track order</h1>
        <p>Enter the phone number you used for purchase, or your order reference (e.g. EXP-XXXXXX).</p>
        <form onSubmit={handleSubmit}>
          <label className="form-label" htmlFor="track-q">Phone or reference</label>
          <input
            id="track-q"
            className="form-input"
            placeholder="0241234567 or EXP-0001"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Searching…" : "Track order"}
          </button>
        </form>

        {results.length > 0 && (
          <div style={{ marginTop: 18 }}>
            {results.map((o) => (
              <div key={o.reference} className="order-row">
                <span>
                  {o.reference} · {o.bundleId} · {o.phone}
                  <br />
                  <small style={{ color: "var(--ink-muted)" }}>
                    {new Date(o.createdAt).toLocaleString()} · GHS {o.amountGHS.toFixed(2)}
                  </small>
                </span>
                <span className={`status-pill status-${o.status}`}>{o.status}</span>
              </div>
            ))}
          </div>
        )}

        <div className="btn-row">
          <Link href="/" className="btn secondary">← Back to bundles</Link>
        </div>
      </div>
    </div>
  );
}
