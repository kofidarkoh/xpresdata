"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { bundles, type Bundle, type Network } from "@/data/bundles";
import { siteConfig, whatsappUrl } from "@/data/config";
import Header from "./Header";
import BundleCard from "./BundleCard";
import CheckoutSheet from "./CheckoutSheet";

type Filter = "All" | Network;

export default function Storefront() {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Bundle | null>(null);

  const networks = useMemo<(Filter)[]>(() => {
    const set = new Set<Network>(bundles.map((b) => b.network));
    return ["All", ...set];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bundles.filter((b) => {
      if (filter !== "All" && b.network !== filter) return false;
      if (!q) return true;
      const text = `${b.network} ${b.volumeMB / 1000}gb`.toLowerCase();
      return text.includes(q);
    });
  }, [filter, query]);

  const countFor = (f: Filter) =>
    f === "All" ? bundles.length : bundles.filter((b) => b.network === f).length;

  return (
    <div className="container">
      <Header />

      <section className="hero">
        <div className="hero-top">
          <div className="avatar">E</div>
          <div>
            <h1>{siteConfig.sellerName}</h1>
            <div className="role">✓ {siteConfig.tagline}</div>
          </div>
        </div>
        <p className="pitch">{siteConfig.pitch}</p>
        <div className="hero-actions">
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="hero-btn">
            💬 {siteConfig.whatsappDisplay}
          </a>
          <Link href="/track-order" className="hero-btn">
            Track order
          </Link>
        </div>
        <div className="stats">
          {siteConfig.stats.map((s) => (
            <div className="stat" key={s.label}>
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="trust">
        <div className="trust-cell">
          <div className="trust-icon">⚡</div>
          <div className="trust-text"><b>Instant</b>delivery</div>
        </div>
        <div className="trust-cell">
          <div className="trust-icon">🔒</div>
          <div className="trust-text"><b>Secure</b>Paystack</div>
        </div>
        <div className="trust-cell">
          <div className="trust-icon">🎧</div>
          <div className="trust-text"><b>24/7</b>support</div>
        </div>
      </div>

      <div className="section-bar">
        <h2>Available bundles</h2>
      </div>

      <div className="search-wrap">
        <span aria-hidden>⌕</span>
        <input
          className="search"
          placeholder="Search bundles… e.g. 2GB"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search bundles"
        />
      </div>

      <div className="filter-pills" role="tablist" aria-label="Filter by network">
        {networks.map((f) => (
          <button
            key={f}
            type="button"
            className={`filter-pill${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}<span className="count">{countFor(f)}</span>
          </button>
        ))}
      </div>

      <div style={{ height: 12 }} />

      {filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>No bundles match your search.</p>
      ) : (
        <div className="bundle-grid">
          {filtered.map((b) => (
            <BundleCard key={b.id} bundle={b} onBuy={setSelected} />
          ))}
        </div>
      )}

      <footer className="footer">
        <div>
          <Link href="/track-order">Track order</Link>
          <span>© 2026 {siteConfig.siteName}</span>
        </div>
        <div>🔒 Secured by Paystack</div>
      </footer>

      {selected && <CheckoutSheet bundle={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
