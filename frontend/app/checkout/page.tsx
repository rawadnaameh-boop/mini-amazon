"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { checkout } from "@/lib/api/order";
import { ShippingDetails } from "@/lib/types";
import { useCart } from "@/context/CartContext";

const initialState: ShippingDetails = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalcode: "",
  country: "",
};
export default function CheckoutPage() {
  const [form, setForm] = useState<ShippingDetails>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { fetchCart } = useCart();

  const handleChange =
    (field: keyof ShippingDetails) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await checkout(form);
      await fetchCart(); // sync browser cart state with the now-empty DB cart
      router.push(`/order-confirmation/${order.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  };

  return (
    <main>
      <h1>Checkout</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 12, maxWidth: 420 }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Full Name
          <input
            required
            value={form.fullName}
            onChange={handleChange("fullName")}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Address Line 1
          <input
            required
            value={form.addressLine1}
            onChange={handleChange("addressLine1")}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Address Line 2 (optional)
          <input
            value={form.addressLine2}
            onChange={handleChange("addressLine2")}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          City
          <input required value={form.city} onChange={handleChange("city")} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Postal Code
          <input
            required
            value={form.postalcode}
            onChange={handleChange("postalcode")}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Country
          <input
            required
            value={form.country}
            onChange={handleChange("country")}
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </main>
  );
}
