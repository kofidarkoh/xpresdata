// ExpressData site config — edit seller details here
export const siteConfig = {
  siteName: "ExpressData",
  sellerName: "ExpressData",
  tagline: "Verified data reseller",
  pitch:
    "Fast, reliable data bundles delivered straight to your phone. Pay with mobile money, get your data in under 30 seconds. Any issue? Message me directly.",
  whatsappNumber: "0598232480", // change to your WhatsApp number
  whatsappDisplay: "0598 232 480",
  stats: [
    { value: "4.9★", label: "Customer rating" },
    { value: "12k+", label: "Orders delivered" },
    { value: "<30s", label: "Avg delivery" },
  ],
};

export function whatsappUrl() {
  const n = siteConfig.whatsappNumber.replace(/\D/g, "");
  const intl = n.startsWith("0") ? "233" + n.slice(1) : n;
  return `https://wa.me/${intl}`;
}
