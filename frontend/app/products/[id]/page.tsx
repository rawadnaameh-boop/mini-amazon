import { notFound } from "next/navigation";
import { getProductById } from "@/lib/api/products";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const product = await getProductById(params.id);

    if (!product) {
        notFound();
    }

    return (
        <main>
            <img
                src={product.imageUrl ?? "/placeholder.png"}
                alt={product.name}
                style={{ maxWidth: 400, width: "100%", borderRadius: 8 }}
            />

            <h1>{product.name}</h1>
            <p>SKU: {product.sku}</p>
            <p>{product.description}</p>
            <p><strong>${product.price.toFixed(2)}</strong></p>

            {!product.isInStock && <p> Out of Stock</p>}

            <AddToCartButton product={product} />
        </main>
    );
}