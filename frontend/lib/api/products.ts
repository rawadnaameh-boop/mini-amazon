import { Product } from "@/lib/types";
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5191/api"
).replace(/\/$/, "")

export async function getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE_URL}/api/products`, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Failed to load products (status ${res.status})`);
    }
    return res.json();
}
export async function getProductById(id: string): Promise<Product | null> {

    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { cache: "no-store" });
    if (res.status === 404) {
        return null;
    }

    if (!res.ok) {
        throw new Error(`Failed to load product ${id} (status ${res.status})`);
    }
    return res.json();
}