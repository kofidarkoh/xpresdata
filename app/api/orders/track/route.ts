import { NextResponse } from "next/server";
import { findByPhone, getOrder } from "@/lib/orders";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  // Reference lookup takes precedence
  const byRef = getOrder(q) ?? getOrder(q.toUpperCase());
  if (byRef) return NextResponse.json({ orders: [byRef] });

  const digits = q.replace(/\D/g, "");
  if (digits.length >= 7) {
    const orders = findByPhone(digits);
    return NextResponse.json({ orders });
  }

  return NextResponse.json({ orders: [] });
}
