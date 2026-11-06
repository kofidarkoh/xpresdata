// Paystack helpers — server only (uses secret key)
export function paystackSecret(): string {
  return process.env.PAYSTACK_SECRET_KEY ?? "";
}

export function paystackConfigured(): boolean {
  return paystackSecret().length > 10;
}

export interface InitializeResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializeTransaction(params: {
  amountPesewas: number;
  email: string;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<InitializeResult> {
  const secret = paystackSecret();
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountPesewas,
      email: params.email,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });
  const data = (await res.json()) as {
    status: boolean;
    message?: string;
    data?: InitializeResult;
  };
  if (!res.ok || !data.status || !data.data) {
    throw new Error(data.message ?? "Paystack initialization failed");
  }
  return data.data;
}

export interface VerifyResult {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
  customer?: { email?: string };
}

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const secret = paystackSecret();
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } }
  );
  const data = (await res.json()) as { status: boolean; message?: string; data?: VerifyResult };
  if (!res.ok || !data.status || !data.data) {
    throw new Error(data.message ?? "Verification failed");
  }
  return data.data;
}
