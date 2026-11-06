// In-memory order store (demo only).
// On Vercel each serverless instance has its own Map — orders will NOT be
// found on verify/track after redeploy/cold start. The verify route falls
// back to Paystack; for reliable tracking swap with a DB (Supabase/Postgres).
export type OrderStatus = "pending" | "paid" | "delivered" | "failed";

export interface Order {
  reference: string;
  bundleId: string;
  phone: string;
  amountGHS: number;
  amountPesewas: number;
  status: OrderStatus;
  paystackReference?: string;
  authorizationUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const globalForOrders = globalThis as unknown as { _orders?: Map<string, Order> };

function store(): Map<string, Order> {
  if (!globalForOrders._orders) globalForOrders._orders = new Map();
  return globalForOrders._orders;
}

export function createOrder(order: Omit<Order, "createdAt" | "updatedAt">): Order {
  const now = new Date().toISOString();
  const full: Order = { ...order, createdAt: now, updatedAt: now };
  store().set(full.reference, full);
  return full;
}

export function getOrder(reference: string): Order | undefined {
  return store().get(reference);
}

export function updateOrder(reference: string, patch: Partial<Order>): Order | undefined {
  const existing = store().get(reference);
  if (!existing) return undefined;
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  store().set(reference, updated);
  return updated;
}

export function findByPhone(phone: string): Order[] {
  const clean = phone.replace(/\D/g, "");
  return [...store().values()].filter((o) => o.phone.replace(/\D/g, "") === clean);
}
