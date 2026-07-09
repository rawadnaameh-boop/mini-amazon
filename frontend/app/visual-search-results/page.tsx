"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type VisualSearchResult = {
  productId: number;
  name: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  similarity: number;
};

export default function VisualSearchResultsPage() {
  const [results, setResults] = useState<VisualSearchResult[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedResults = localStorage.getItem("visualSearchResults");

    if (storedResults) {
      try {
        const parsedResults: VisualSearchResult[] = JSON.parse(storedResults);
        setResults(parsedResults);
      } catch (error) {
        console.error("Failed to parse visual search results:", error);
        setResults([]);
      }
    }

    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main style={{ padding: "32px" }}>
        <h1>Loading visual search results...</h1>
      </main>
    );
  }

  return (
    <main style={{ padding: "32px" }}>
      <h1>Visual Search Results</h1>

      <p style={{ marginBottom: "24px", color: "#555" }}>
        These are the products that look most similar to the image you uploaded.
      </p>

      {results.length === 0 ? (
        <div>
          <p>No visual search results found.</p>

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
          {results.map((product) => (
            <div
              key={product.productId}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "14px",
                backgroundColor: "#fff",
              }}
            >
              <Link
                href={`/products/${product.productId}`}
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
                <p style={{ color: "green", marginBottom: "8px" }}>In Stock</p>
              ) : (
                <p style={{ color: "red", marginBottom: "8px" }}>
                  Out of Stock
                </p>
              )}

              <p
                style={{
                  fontSize: "13px",
                  color: "#666",
                }}
              >
                Similarity: {(product.similarity * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
