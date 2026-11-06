import Link from "next/link";
import { siteConfig } from "@/data/config";

export default function Header() {
  return (
    <header className="header">
      <Link href="/" className="brand">
        <span className="brand-mark">E</span>
        {siteConfig.siteName}
      </Link>
      <nav className="header-links">
        <span>
          <span className="open-dot" /> Open for orders
        </span>
        <Link href="/track-order">Track order</Link>
      </nav>
    </header>
  );
}
