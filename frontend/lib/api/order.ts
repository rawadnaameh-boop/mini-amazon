import { OrderResult, ShippingDetails } from "@/lib/types";

const MOCK_USER_ID = 1;

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5191/api"
).replace(/\/$/, "");

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.message ?? body?.title ?? `Request failed (status ${res.status})`,
    );
  }
  return res.json();
}

export async function checkout(shipping: ShippingDetails): Promise<OrderResult> {
  const res = await fetch(
    `${API_BASE_URL}/orders/checkout?userId=${MOCK_USER_ID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shipping),
    },
  );
  return handleResponse<OrderResult>(res);
}

export async function getOrder(orderId: number): Promise<OrderResult> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    cache: "no-store",
  });
  return handleResponse<OrderResult>(res);
}
