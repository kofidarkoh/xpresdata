// XpresData site config — edit seller details here
export const siteConfig = {
  siteName: "XpresData",
  sellerName: "XpresData",
  tagline: "Verified data reseller",
  pitch:
    "Fast, reliable data bundles delivered straight to your phone. Pay with mobile money, get your data in under 30 seconds. Any issue? Message me directly.",
  stats: [
    { value: "4.9★", label: "Customer rating" },
    { value: "12k+", label: "Orders delivered" },
    { value: "<30s", label: "Avg delivery" },
  ],
};

// No real contact address — WhatsApp is shown as a fake icon only.
export function whatsappUrl() {
  return "#";
}
