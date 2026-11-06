"use client";

import { formatVolume, pricePerGB, type Bundle } from "@/data/bundles";

interface Props {
  bundle: Bundle;
  onBuy: (b: Bundle) => void;
}

export default function BundleCard({ bundle, onBuy }: Props) {
  const badgeClass = bundle.badge === "Most popular" ? "badge-popular" : "badge-value";
  const perGB = pricePerGB(bundle);
  // Only show per-GB on 5GB+ like reference
  const showPerGB = bundle.volumeMB >= 5000;

  return (
    <article className="pkg">
      {bundle.badge && <span className={`pkg-badge ${badgeClass}`}>{bundle.badge}</span>}
      <div className="pkg-row">
        <div className="net-tag" style={{ background: bundle.color, color: bundle.textColor }}>
          {bundle.network}
        </div>
        <div className="pkg-body">
          <div className="pkg-name">{formatVolume(bundle.volumeMB)}</div>
          <div className="pkg-meta">
            <span>🗓 {bundle.validity}</span>
            <span>⚡ Instant</span>
            {showPerGB && <span className="pkg-meta-save">{perGB}</span>}
          </div>
        </div>
        <div className="pkg-right">
          <div className="pkg-price">
            <span className="c">GHS</span>
            {bundle.priceGHS.toFixed(2)}
          </div>
        </div>
      </div>
      <button type="button" className="pkg-buy" onClick={() => onBuy(bundle)}>
        Buy now →
      </button>
    </article>
  );
}
