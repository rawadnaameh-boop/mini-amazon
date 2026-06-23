import Link from "next/link";
import { Product } from "@/lib/types";
import AddToCartButton from "./AddToCartButton";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }: { product: Product }) {
    return (
        <div className={styles.card}>
            <Link href={`/products/${product.id}`}>
                <img
                    src={product.imageUrl ?? "/placeholder.png"}
                    alt={product.name}
                    className={styles.image}
                />
                <h3>{product.name}</h3>
            </Link>

            <span className={styles.price}>${product.price.toFixed(2)}</span>

            {!product.isInStock && <span className={styles.badge}>Out of Stock</span>}

            <AddToCartButton product={product} />
        </div>
    );
}