"use client";

import { useEffect, useState } from "react";
import { formatVolume, ghs, type Bundle } from "@/data/bundles";

interface Props {
  bundle: Bundle | null;
  onClose: () => void;
}

export default function CheckoutSheet({ bundle, onClose }: Props) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Lock scroll + Esc to close
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!bundle) return null;

  function handlePhone(value: string) {
    setPhone(value.replace(/\D/g, "").slice(0, 10));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length !== 10) {
      setError("Phone number must be 10 digits.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleId: bundle!.id, phone }),
      });
      const data = (await res.json()) as { authorization_url?: string; error?: string };
      if (!res.ok || !data.authorization_url) {
        setError(data.error ?? "Failed to initialize payment. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.authorization_url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Complete your purchase" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h4>Complete your purchase</h4>
          <button className="close-btn" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="sheet-body">
          <div className="form-package-info">
            <b>Selected package</b>
            {bundle.network} {formatVolume(bundle.volumeMB)} — {ghs(bundle.priceGHS)}
          </div>

          <form onSubmit={handleSubmit}>
            <label className="form-label" htmlFor="beneficiary_number">
              Phone number to receive data
            </label>
            <input
              id="beneficiary_number"
              className="form-input"
              type="tel"
              inputMode="numeric"
              autoFocus
              placeholder="0241234567"
              value={phone}
              onChange={(e) => handlePhone(e.target.value)}
              maxLength={10}
              required
            />
            <div className="form-helper">Enter the number that will receive the data bundle.</div>
            {error && <div className="form-error" role="alert">{error}</div>}

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? "Processing payment…" : `Pay ${ghs(bundle.priceGHS)}`}
            </button>
            <div className="secure-note">🔒 Secured by Paystack · MoMo &amp; Card</div>
          </form>
        </div>
      </div>
    </div>
  );
}
