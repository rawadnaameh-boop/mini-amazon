"use client";

import { useState } from "react";
import { Review } from "@/lib/types";
import SentimentBadge from "./SentimentBadge";
import ReviewForm from "./ReviewForm";
import ReviewsList from "./ReviewsList";

export default function ReviewsSection({
  productId,
  initialReviews,
}: {
  productId: number;
  initialReviews: Review[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const handleSubmitted = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
  };
  return (
    <section style={{ marginTop: 48 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 16,
          paddingBottom: 8,
          borderBottom: "1px solid #dce3dd",
        }}
      >
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "#24292f",
            margin: 0,
          }}
        >
          Reviews
        </h2>
        <SentimentBadge reviews={reviews} />
      </div>
      <ReviewForm productId={productId} onSubmitted={handleSubmitted} />
      <ReviewsList reviews={reviews} />
    </section>
  );
}
