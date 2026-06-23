"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Matches your C# CartResponseDto layout exactly
interface CartItemDto {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalItemPrice: number;
}

interface CartResponseDto {
    cartId: number;
    items: CartItemDto[];
    cartTotal: number;
}

interface CartContextType {
    cart: CartResponseDto | null;
    isDrawerOpen: boolean;
    errorAlert: string | null;
    setDrawerOpen: (open: boolean) => void;
    clearError: () => void;
    fetchCart: () => Promise<void>;
    addToCart: (productId: number, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Hardcoded user ID to match our backend prototyping configuration
const MOCK_USER_ID = 1;
const BASE_API_URL = "http://localhost:5191/api/cart"; // Update port to match your running backend!

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartResponseDto | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [errorAlert, setErrorAlert] = useState<string | null>(null);

    const fetchCart = async () => {
        try {
            const res = await fetch(`${BASE_API_URL}?userId=${MOCK_USER_ID}`);
            if (res.ok) {
                const data = await res.json();
                setCart(data);
            }
        } catch (err) {
            console.error("Failed to fetch cart data", err);
        }
    };

    const addToCart = async (productId: number, quantity: number) => {
        try {
            const res = await fetch(`${BASE_API_URL}/add?userId=${MOCK_USER_ID}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, quantity }), // Only sending IDs & quantity (Frontend Price Protection)
            });

            if (!res.ok) {
                const errorData = await res.json();
                // INTERCEPTING BUSINESS LOGIC ERROR
                if (errorData.error === "ITEM_SOLD_OUT") {
                    setErrorAlert("Sorry, this item just sold out!");
                    return;
                }
                throw new Error("Generic server error occurred");
            }

            const updatedCart = await res.json();
            setCart(updatedCart);
            setIsDrawerOpen(true); // Open panel automatically to give instant visual feedback
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <CartContext.Provider value={{
            cart,
            isDrawerOpen,
            errorAlert,
            setDrawerOpen: setIsDrawerOpen,
            clearError: () => setErrorAlert(null),
            fetchCart,
            addToCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used inside a CartProvider");
    return context;
}