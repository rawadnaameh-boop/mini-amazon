import { getProducts } from "@/lib/api/products";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
    const products = await getProducts();

    return (
        <main>
            <h1>Mini Amazon</h1>

            {products == null || products.length === 0 ? (
                <p>No products available right now.</p>
            ) : (
                <div className="grid">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </main>
    );
}