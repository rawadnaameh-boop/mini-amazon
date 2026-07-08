import { Review } from "@/lib/types";

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

export async function getReviews(productId: number): Promise<Review[]> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
    cache: "no-store",
  });
  return handleResponse<Review[]>(res);
}

export async function createReview(
  productId: number,
  text: string,
): Promise<Review> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return handleResponse<Review>(res);
}