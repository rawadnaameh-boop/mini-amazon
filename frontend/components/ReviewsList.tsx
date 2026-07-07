import { Review } from "@/lib/types";

function sentimentColor(score: number): string {
  if (score >= 0.2) return "#1f7a4d";
  if (score <= -0.2) return "#b1502e";
  return "#9c7a1f";
}

export default function ReviewsList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p style={{ color: "#5b6b62", fontSize: "0.9rem" }}>
        No reviews yet — be the first to write one.
      </p>
    );
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {reviews.map((review) => (
        <li
          key={review.id}
          style={{
            padding: "14px 0",
            borderBottom: "1px solid #dce3dd",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: sentimentColor(review.sentimentScore),
              }}
            >
              {/* {review.sentimentScore >= 0 ? "+" : ""}
              {review.sentimentScore.toFixed(2)} sentiment */}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#8a988f" }}>
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p style={{ margin: 0, color: "#1b2420", lineHeight: 1.6 }}>
            {review.text}
          </p>
        </li>
      ))}
    </ul>
  );
}
