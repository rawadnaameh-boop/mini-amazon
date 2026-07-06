import { notFound } from "next/navigation";
import { getProductById } from "@/lib/api/products";
import AddToCartButton from "@/components/AddToCartButton";
import FrequentlyBoughtTogether from "@/components/FrequentlyBoughtTogether";

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    return (
        <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
                <img
                    src={product.imageUrl ?? "/placeholder.png"}
                    alt={product.name}
                    style={{
                        width: 360,
                        maxWidth: "100%",
                        borderRadius: 8,
                        objectFit: "cover",
                        flexShrink: 0,
                        border: "1px solid #d0d7de",
                    }}
                />
                <div style={{ flex: 1, minWidth: 240 }}>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8, color: "#24292f" }}>
                        {product.name}
                    </h1>
                    <p style={{ color: "#57606a", fontSize: "0.875rem", marginBottom: 12 }}>
                        SKU: {product.sku}
                    </p>
                    <p style={{ color: "#24292f", lineHeight: 1.6, marginBottom: 20 }}>
                        {product.description}
                    </p>
                    <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#24292f", marginBottom: 16 }}>
                        ${product.price.toFixed(2)}
                    </p>
                    {!product.isInStock && (
                        <p style={{ color: "#cf222e", fontWeight: 600, marginBottom: 12 }}>
                            Out of Stock
                        </p>
                    )}
                    <AddToCartButton product={product} />
                </div>
            </div>

            <FrequentlyBoughtTogether recommendations={product.recommendations} />
        </main>
    );
}
