"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Product = {
  id?: number;
  productId?: number;
  name: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
};

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const apiBaseUrl = (
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5191/api"
        ).replace(/\/$/, "");

        const response = await fetch(`${apiBaseUrl}/products`);

        if (!response.ok) {
          throw new Error("Failed to fetch products.");
        }

        const data: Product[] = await response.json();

        const filteredProducts = data.filter((product) =>
          product.name.toLowerCase().includes(query.toLowerCase()),
        );

        setProducts(filteredProducts);
      } catch (error) {
        console.error("Search failed:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [query]);

  if (loading) {
    return (
      <main style={{ padding: "32px" }}>
        <h1>Searching...</h1>
      </main>
    );
  }

  return (
    <main style={{ padding: "32px" }}>
      <h1>Search Results</h1>

      <p style={{ marginBottom: "24px", color: "#555" }}>
        Showing results for: <strong>{query}</strong>
      </p>

      {products.length === 0 ? (
        <div>
          <p>No products found.</p>
          <Link href="/">Back to homepage</Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {products.map((product) => {
            const productId = product.id ?? product.productId;

            return (
              <div
                key={productId}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "14px",
                  backgroundColor: "#fff",
                }}
              >
                <Link
                  href={`/products/${productId}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      marginBottom: "12px",
                    }}
                  />

                  <h2
                    style={{
                      fontSize: "18px",
                      marginBottom: "8px",
                    }}
                  >
                    {product.name}
                  </h2>
                </Link>

                <p
                  style={{
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  ${product.price}
                </p>

                {product.stockQuantity > 0 ? (
                  <p style={{ color: "green", marginBottom: "8px" }}>
                    In Stock
                  </p>
                ) : (
                  <p style={{ color: "red", marginBottom: "8px" }}>
                    Out of Stock
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
