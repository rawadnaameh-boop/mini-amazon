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
    getOrder(Number(params.orderId))
      .then(setOrder)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load order"),
      );
  }, [params.orderId]);

  if (error)
    return (
      <main>
        <h1>Order Confirmation</h1>
        <p style={{ color: "crimson" }}>{error}</p>
      </main>
    );
  if (!order)
    return (
      <main>
        <h1>Order Confirmation</h1>
        <p>Loading...</p>
      </main>
    );

  return (
    <main>
      <h1>Thank you!</h1>
      <p>Your order has been placed successfully.</p>
      <p>
        <strong>Order #{order.orderId}</strong> ·{" "}
        {new Date(order.createAtUtc).toLocaleString()}
      </p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {order.items.map((item) => (
          <li
            key={item.productId}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span>
              {item.productName} × {item.quantity}
            </span>
            <span>${item.lineTotal.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <h2>Total: ${order.totalAmount.toFixed(2)}</h2>
      <Link href="/">Continue shopping</Link>
    </main>
  );
}
