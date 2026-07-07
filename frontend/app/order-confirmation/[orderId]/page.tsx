"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { OrderResult } from "@/lib/types";
import { getOrder } from "@/lib/api/order";

export default function OrderConfirmationPage() {
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 🆕 Dynamically grab the active workspace user ID
    const userId = typeof window !== "undefined" ? localStorage.getItem("simulated_user_id") || "1" : "1";

    // 🆕 Updated to pass both the orderId AND the simulated userId to the backend validation gate
    getOrder(Number(params.orderId), userId)
      .then(setOrder)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load order"),
      );
  }, [params.orderId]);

  if (error)
    return (
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "16px" }}>Order Confirmation</h1>
        <p style={{ color: "crimson", backgroundColor: "#fff5f5", padding: "12px", borderRadius: "6px", border: "1px solid #ffe3e3" }}>
          {error}
        </p>
      </main>
    );

  if (!order)
    return (
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "16px" }}>Order Confirmation</h1>
        <p>Loading your order details...</p>
      </main>
    );

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#2e7d32", marginBottom: "8px" }}>Thank you!</h1>
      <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "24px" }}>
        Your order has been placed successfully.
      </p>
      
      <div style={{ backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "8px", marginBottom: "24px", border: "1px solid #e9ecef" }}>
        <strong style={{ fontSize: "1.1rem" }}>Order #{order.orderId}</strong>
        <span style={{ color: "#6c757d", marginLeft: "12px" }}>
          · {new Date(order.createAtUtc).toLocaleString()}
        </span>
      </div>

      <h3 style={{ borderBottom: "1px solid #dee2e6", paddingBottom: "8px", marginBottom: "16px" }}>Items Purchased</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0" }}>
        {order.items.map((item) => (
          <li
            key={item.productId}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
              paddingBottom: "12px",
              borderBottom: "1px dashed #e9ecef"
            }}
          >
            <span style={{ color: "#333" }}>
              {item.productName} <strong style={{ color: "#6c757d", marginLeft: "4px" }}>× {item.quatity}</strong>
            </span>
            <span style={{ fontWeight: 600 }}>${item.lineTotal.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h2 style={{ margin: 0 }}>Total amount paid:</h2>
        <h2 style={{ margin: 0, color: "#B12704" }}>${order.totalAmount.toFixed(2)}</h2>
      </div>

      <Link 
        href="/" 
        style={{ 
          display: "inline-block", 
          backgroundColor: "#FFD814", 
          color: "#0F1111", 
          textDecoration: "none", 
          padding: "12px 24px", 
          borderRadius: "8px", 
          fontWeight: "bold",
          boxShadow: "0 2px 5px rgba(213,217,217,.5)",
          textAlign: "center"
        }}
      >
        Continue Shopping
      </Link>
    </main>
  );
}