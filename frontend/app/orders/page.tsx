import Link from "next/link";
import { Order } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5191/api";

// Fetch data from the secure backend endpoint using our mock user ID
async function getOrderHistory(): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/orders?userId=1`, { 
    cache: "no-store" // Ensures we always get fresh data when a user completes checkout
  });
  
  if (!res.ok) {
    throw new Error(`Failed to load order history (Status ${res.status})`);
  }
  
  return res.json();
}

export default async function OrdersPage() {
  let orders: Order[] = [];
  let errorMsg = "";

  try {
    orders = await getOrderHistory();
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
  }

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px", color: "#111" }}>
        Your Orders
      </h1>
      
      {errorMsg && (
        <div style={{ backgroundColor: "#FFF8F8", border: "1px solid #CC0000", padding: "15px", borderRadius: "4px", color: "#CC0000", marginBottom: "20px" }}>
          {errorMsg}
        </div>
      )}

      {orders.length === 0 && !errorMsg ? (
        <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#555", fontSize: "16px" }}>You haven't placed any orders yet.</p>
          <Link href="/" style={{ marginTop: "15px", display: "inline-block", color: "#007185", textDecoration: "none", fontWeight: "bold" }}>
            Go back to shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((order) => (
            <div key={order.orderId} style={{ backgroundColor: "#fff", border: "1px solid #D5D9D9", borderRadius: "8px", overflow: "hidden" }}>
              
              {/* Order Card Header Section */}
              <div style={{ backgroundColor: "#F0F2F2", padding: "14px 20px", borderBottom: "1px solid #D5D9D9", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", fontSize: "12px", color: "#565959" }}>
                <div>
                  <span style={{ display: "block", textTransform: "uppercase", fontWeight: "500" }}>Order Placed</span>
                  <span style={{ fontSize: "14px", color: "#111" }}>{new Date(order.createAtUtc).toLocaleDateString()}</span>
                </div>
                <div>
                  <span style={{ display: "block", textTransform: "uppercase", fontWeight: "500" }}>Total</span>
                  <span style={{ fontSize: "14px", fontWeight: "bold", color: "#111" }}>${order.totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <span style={{ display: "block", textTransform: "uppercase", fontWeight: "500" }}>Order # {order.orderId}</span>
                  <Link 
                    href={`/orders/${order.orderId}`} 
                    className="receipt-link"
                    style={{ fontSize: "14px", color: "#007185", textDecoration: "none" }}
                  >
                    View Itemized Receipt
                  </Link>
                </div>
              </div>

              {/* Order Card Body Section */}
              <div style={{ padding: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "#111" }}>
                  Items Summary ({order.items.length})
                </h3>
                <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                  {order.items.map((item, index) => (
                    <li key={index} style={{ padding: "8px 0", borderBottom: index === order.items.length - 1 ? "none" : "1px dashed #E7E7E7", fontSize: "14px", color: "#111", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <strong style={{ color: "#007185" }}>{item.productName}</strong>
                        <span style={{ color: "#565959", marginLeft: "10px" }}>x {item.quatity}</span>
                      </div>
                      <span style={{ fontWeight: "500", color: "#565959" }}>
                        ${item.lineTotal.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Scoped global styles safely handling pseudo-classes in Next.js Server Components */}
      <style>{`
        .receipt-link:hover {
          text-decoration: underline !important;
          color: #c45500 !important;
        }
      `}</style>
    </div>
  );
}