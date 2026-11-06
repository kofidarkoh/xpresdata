export type Network = "MTN" | "Telecel" | "AT";

export interface Bundle {
  id: string;
  network: Network;
  volumeMB: number;
  priceGHS: number; // selling price in cedis
  validity: string;
  badge?: "Most popular" | "Best value";
  color: string;
  textColor: string;
}

const MTN = "#FECC30";
const TELECEL = "#7B61FF";
const AT = "#F87171";

export const bundles: Bundle[] = [
  { id: "mtn-1gb", network: "MTN", volumeMB: 1000, priceGHS: 5.5, validity: "90 days", badge: "Most popular", color: MTN, textColor: "#0F172A" },
  { id: "mtn-2gb", network: "MTN", volumeMB: 2000, priceGHS: 10.0, validity: "90 days", badge: "Best value", color: MTN, textColor: "#0F172A" },
  { id: "mtn-3gb", network: "MTN", volumeMB: 3000, priceGHS: 16.0, validity: "90 days", color: MTN, textColor: "#0F172A" },
  { id: "mtn-4gb", network: "MTN", volumeMB: 4000, priceGHS: 21.5, validity: "90 days", color: MTN, textColor: "#0F172A" },
  { id: "mtn-5gb", network: "MTN", volumeMB: 5000, priceGHS: 26.0, validity: "90 days", color: MTN, textColor: "#0F172A" },
  { id: "mtn-6gb", network: "MTN", volumeMB: 6000, priceGHS: 32.0, validity: "90 days", color: MTN, textColor: "#0F172A" },
  // Add Telecel / AT rows here when live, e.g.:
  // { id: "tcel-5gb", network: "Telecel", volumeMB: 5000, priceGHS: 24.0, validity: "90 days", color: TELECEL, textColor: "#FFFFFF" },
];

export function getBundle(id: string): Bundle | undefined {
  return bundles.find((b) => b.id === id);
}

export function formatVolume(mb: number): string {
  if (mb >= 1000) {
    const gb = mb / 1000;
    return `${Number.isInteger(gb) ? gb : gb.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} GB`;
  }
  return `${mb} MB`;
}

export function pricePerGB(b: Bundle): string {
  const gb = b.volumeMB / 1000;
  return `GHS ${(b.priceGHS / gb).toFixed(2)}/GB`;
}

export function ghs(n: number): string {
  return `GHS ${n.toFixed(2)}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _networks: Record<Network, { color: string; textColor: string }> = {
  MTN: { color: MTN, textColor: "#0F172A" },
  Telecel: { color: TELECEL, textColor: "#FFFFFF" },
  AT: { color: AT, textColor: "#FFFFFF" },
};
