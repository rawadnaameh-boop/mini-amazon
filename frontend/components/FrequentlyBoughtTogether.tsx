import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function FrequentlyBoughtTogether({
  recommendations,
}: {
  recommendations: Product[];
}) {
  if (recommendations.length === 0) return null;

  return (
    <section style={{ marginTop: 48 }}>
      <h2
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#24292f",
          marginBottom: 16,
          paddingBottom: 8,
          borderBottom: "1px solid #d0d7de",
        }}
      >
        Recommended Products
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
