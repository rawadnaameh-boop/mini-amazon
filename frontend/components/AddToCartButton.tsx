"use client";

import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function AddToCartButton({ product }: { product: Product }) {
    const { addToCart, errorAlert, clearError } = useCart();

    const handleAddToCart = async () => {
        // Enforcing initial standard quantity increment of 1
        await addToCart(product.id, 1); 
    };

    return (
        <>
            <button 
                onClick={handleAddToCart} 
                disabled={!product.isInStock}
                style={{ cursor: product.isInStock ? "pointer" : "not-allowed" }}
            >
                {product.isInStock ? "Add to Cart" : "Out of Stock"}
            </button>

            {/* CRUCIAL ACCEPTANCE CRITERIA: Slid-in alert intercepting warehouse exhaustion */}
            <Snackbar 
                open={errorAlert !== null} 
                autoHideDuration={4000} 
                onClose={clearError}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={clearError} severity="error" variant="filled" sx={{ width: '100%' }}>
                    {errorAlert}
                </Alert>
            </Snackbar>
        </>
    );
}