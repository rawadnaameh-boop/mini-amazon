"use client";

import { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
    const handleAddToCart = () => {
        //  the Cart feature is implemented here later 
        console.log(`Add to cart: product #${product.id} (${product.name})`);
    };

    return (
        <button onClick={handleAddToCart} disabled={!product.isInStock}>
            {product.isInStock ? "Add to Cart" : "Out of Stock"}
        </button>
    );
}