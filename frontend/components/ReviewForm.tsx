"use client";

import { useState } from "react";
import { Review } from "@/lib/types";
import { createReview } from "@/lib/api/reviews";

export default function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: number;
  onSubmitted: (review: Review) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const review = await createReview(productId, text.trim());
      onSubmitted(review);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share what you think of this product..."
        rows={3}
        disabled={loading}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 8,
          border: "1px solid #dce3dd",
          fontFamily: "inherit",
          fontSize: "0.9rem",
          resize: "vertical",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <span style={{ fontSize: "0.78rem", color: "#8a988f" }}>
          
        </span>
        <button type="submit" disabled={loading || !text.trim()}>
          {loading ? "submitting" : "Submit Review"}
        </button>
      </div>
      {error && (
        <p style={{ color: "#b1502e", fontSize: 13, marginTop: 6 }}>{error}</p>
      )}
    </form>
  );
}
