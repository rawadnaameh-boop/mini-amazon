"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, updateCartItem, removeCartItem, errorAlert, clearError } = useCart();

  if (!cart)
    return (
      <main>
        <h1>Your Cart</h1>
        <p>Loading...</p>
      </main>
    );

  return (
    <main>
      <h1>Your Cart</h1>

      {errorAlert && (
        <p style={{ color: "crimson" }}>
          {errorAlert}{" "}
          <button onClick={clearError} style={{ marginLeft: 8 }}>
            ×
          </button>
        </p>
      )}

      {cart.items.length === 0 ? (
        <p>
          Your cart is empty. <Link href="/">Continue shopping</Link>
        </p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cart.items.map((item) => (
              <li
                key={item.productId}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div>{item.productName}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    ${item.unitPrice.toFixed(2)} each
                  </div>
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateCartItem(item.productId, Number(e.target.value))
                  }
                  style={{ width: 60 }}
                />
                <div style={{ width: 80, textAlign: "right" }}>
                  ${item.totalItemPrice.toFixed(2)}
                </div>
                <button onClick={() => removeCartItem(item.productId)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <h2>Total: ${cart.cartTotal.toFixed(2)}</h2>

          <Link href="/checkout">
            <button>Proceed to Checkout</button>
          </Link>
        </>
      )}
    </main>
  );
}
