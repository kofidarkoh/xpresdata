import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExpressData — Buy Data Bundles Instantly",
  description:
    "Fast, reliable data bundles delivered straight to your phone. Pay with mobile money, get your data in under 30 seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
