"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
  updateCartItem: (productId: number, quantity: number) => Promise<void>;
  removeCartItem: (productId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// .env.local configuration
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5191/api"
).replace(/\/$/, "");

const CART_URL = `${API_BASE_URL}/Cart`;

// Dynamic helper function to safely pull active simulated profile ID
const getActiveUserId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("simulated_user_id") || "1";
  }
  return "1";
};

async function handleCartResponse(res: Response): Promise<CartResponseDto> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    if (errorData?.error === "ITEM_SOLD_OUT") {
      throw new Error("Sorry, this item just sold out!");
    }

    throw new Error(
      errorData?.message ??
        errorData?.title ??
        `Cart request failed with status ${res.status}`,
    );
  }

  return res.json();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartResponseDto | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  const fetchCart = async () => {
    const userId = getActiveUserId();
    try {
      const res = await fetch(`${CART_URL}?userId=${userId}`, {
        cache: "no-store",
      });

      const data = await handleCartResponse(res);
      setCart(data);
    } catch (err) {
      console.error("Failed to fetch cart data", err);

      const message =
        err instanceof Error ? err.message : "Failed to fetch cart.";
      setErrorAlert(message);
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    const userId = getActiveUserId();
    try {
      const res = await fetch(`${CART_URL}/add?userId=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const updatedCart = await handleCartResponse(res);

      setCart(updatedCart);
      setIsDrawerOpen(true);
      setErrorAlert(null);
    } catch (err) {
      console.error("Failed to add item to cart", err);

      const message =
        err instanceof Error ? err.message : "Failed to add item to cart.";
      setErrorAlert(message);
    }
  };

  const updateCartItem = async (productId: number, quantity: number) => {
    const userId = getActiveUserId();
    try {
      const res = await fetch(`${CART_URL}/items?userId=${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const updatedCart = await handleCartResponse(res);

      setCart(updatedCart);
      setErrorAlert(null);
    } catch (err) {
      console.error("Failed to update cart item", err);

      const message =
        err instanceof Error ? err.message : "Failed to update cart item.";
      setErrorAlert(message);
    }
  };

  const removeCartItem = async (productId: number) => {
    const userId = getActiveUserId();
    try {
      const res = await fetch(
        `${CART_URL}/items/${productId}?userId=${userId}`,
        {
          method: "DELETE",
        },
      );

      const updatedCart = await handleCartResponse(res);

      setCart(updatedCart);
      setErrorAlert(null);
    } catch (err) {
      console.error("Failed to remove cart item", err);

      const message =
        err instanceof Error ? err.message : "Failed to remove cart item.";
      setErrorAlert(message);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isDrawerOpen,
        errorAlert,
        setDrawerOpen: setIsDrawerOpen,
        clearError: () => setErrorAlert(null),
        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }

  return context;
}