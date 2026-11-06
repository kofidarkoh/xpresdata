import Link from "next/link";
import { siteConfig } from "@/data/config";
import WhatsAppIcon from "./WhatsAppIcon";

export default function Header() {
  return (
    <header className="header">
      <Link href="/" className="brand">
        <span className="brand-mark">X</span>
        {siteConfig.siteName}
      </Link>
      <nav className="header-links">
        <span>
          <span className="open-dot" /> Open for orders
        </span>
        <Link href="/track-order">Track order</Link>
        <span className="contact-link fake-icon" aria-label="Contact us" role="img">
          <WhatsAppIcon size={16} />
        </span>
      </nav>
    </header>
  );
}
