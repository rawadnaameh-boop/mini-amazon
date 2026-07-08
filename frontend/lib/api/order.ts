import { OrderResult, ShippingDetails } from "@/lib/types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5191/api"
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

/**
 * Executes a complete cart checkout sequence against the C# database registry
 * @param shipping Shipping address context payload
 * @param userId The dynamic active workspace simulation identifier
 * @param items Optional array buffer passed from checkout page layout context
 */
export async function checkout(
  shipping: ShippingDetails, 
  userId: string, 
  items?: any[]
): Promise<OrderResult> {
  // ✅ Dynamically points query parameters to the active simulated workspace account
  const res = await fetch(
    `${API_BASE_URL}/orders/checkout?userId=${userId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shipping),
    },
  );
  return handleResponse<OrderResult>(res);
}

export async function getOrder(orderId: number, userId: string): Promise<OrderResult> {
  // ✅ Appends the dynamic simulation ID to clear the backend ownership validation gate
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}?userId=${userId}`, {
    cache: "no-store",
  });
  return handleResponse<OrderResult>(res);
}