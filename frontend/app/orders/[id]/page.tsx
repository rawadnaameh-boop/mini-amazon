import Link from "next/link";
import { Order } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5191/api";

async function getOrderDetails(id: string): Promise<Order | null> {
  const res = await fetch(`${API_BASE_URL}/orders/${id}?userId=1`, {
    cache: "no-store"
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to load order details (Status ${res.status})`);
  }

  return res.json();
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const { id } = await params;
  let order: Order | null = null;
  let errorMsg = "";

  try {
    order = await getOrderDetails(id);
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      
      {/* Back Navigation Nav */}
      <div style={{ marginBottom: "20px" }}>
        <Link href="/orders" style={{ color: "#007185", textDecoration: "none", fontSize: "14px" }} className="back-link">
          &larr; Back to Your Orders
        </Link>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: "#FFF8F8", border: "1px solid #CC0000", padding: "15px", borderRadius: "4px", color: "#CC0000" }}>
          {errorMsg}
        </div>
      )}

      {!order && !errorMsg ? (
        <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "40px", textAlign: "center" }}>
          <h2 style={{ color: "#111", fontSize: "20px", marginBottom: "10px" }}>Order Not Found</h2>
          <p style={{ color: "#555" }}>This order receipt does not exist or you do not have permission to view it.</p>
        </div>
      ) : order ? (
        <div style={{ backgroundColor: "#fff", border: "1px solid #D5D9D9", borderRadius: "8px", padding: "24px" }}>
          
          {/* Receipt Meta Panel */}
          <div style={{ borderBottom: "1px solid #E7E7E7", paddingBottom: "20px", marginBottom: "20px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 8px 0", color: "#111" }}>
              Order Details
            </h1>
            <div style={{ display: "flex", gap: "20px", fontSize: "14px", color: "#565959", flexWrap: "wrap" }}>
              <span>Ordered on {new Date(order.createAtUtc).toLocaleDateString()}</span>
              <span>|</span>
              <span>Order ID: # {order.orderId}</span>
            </div>
          </div>

          {/* Itemized Grid */}
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginBottom: "30px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E7E7E7", fontSize: "13px", color: "#565959", textTransform: "uppercase" }}>
                <th style={{ paddingBottom: "10px", fontWeight: "600" }}>Product Item</th>
                <th style={{ paddingBottom: "10px", fontWeight: "600", width: "100px", textAlign: "center" }}>Price</th>
                <th style={{ paddingBottom: "10px", fontWeight: "600", width: "80px", textAlign: "center" }}>Qty</th>
                <th style={{ paddingBottom: "10px", fontWeight: "600", width: "120px", textAlign: "right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #E7E7E7", fontSize: "15px" }}>
                  <td style={{ padding: "16px 0", color: "#007185", fontWeight: "bold" }}>
                    {item.productName}
                    <div style={{ fontSize: "11px", color: "#767676", fontWeight: "normal", marginTop: "4px" }}>
                      Snapshot verified historical pricing active
                    </div>
                  </td>
                  <td style={{ padding: "16px 0", textAlign: "center", color: "#111" }}>
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td style={{ padding: "16px 0", textAlign: "center", color: "#565959" }}>
                    {item.quatity}
                  </td>
                  <td style={{ padding: "16px 0", textAlign: "right", fontWeight: "500", color: "#111" }}>
                    ${item.lineTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Invoice Summary Block */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: "280px", backgroundColor: "#F7F7F7", padding: "20px", borderRadius: "6px", border: "1px solid #E7E7E7" }}>
              <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", borderBottom: "1px solid #E7E7E7", paddingBottom: "8px", color: "#111" }}>
                Payment Summary
              </h3>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#565959", marginBottom: "10px" }}>
                <span>Items Subtotal:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#565959", marginBottom: "15px" }}>
                <span>Shipping & Handling:</span>
                <span style={{ color: "#2B7345", fontWeight: "500" }}>FREE</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "bold", color: "#B12704", borderTop: "1px solid #E7E7E7", paddingTop: "12px" }}>
                <span>Grand Total:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      ) : null}

      <style>{`
        .back-link:hover {
          text-decoration: underline !important;
          color: #c45500 !important;
        }
      `}</style>
    </div>
  );
}