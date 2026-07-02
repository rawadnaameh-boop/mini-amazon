"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addToCart } = useCart();
  const handleAddToCart = async () => {
    setLoading(true);
    setError(null);
    try {
      await addToCart(product.id, 1);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleAddToCart}
        disabled={!product.isInStock || loading}
      >
        {product.isInStock
          ? loading
            ? "Adding..."
            : "Add to Cart"
          : "Out of Stock"}
      </button>
      {error && <p style={{ color: "crimson", fontSize: 13 }}>{error}</p>}
    </div>
  );
}
