import { Review } from "@/lib/types";

function averageScore(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + review.sentimentScore, 0);
  return total / reviews.length;
}

function toPositivePercent(score: number): number {
  return Math.round(((score + 1) / 2) * 100);
}

export default function SentimentBadge({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return null;
  }
  const percent = toPositivePercent(averageScore(reviews));
  const tier =
    percent >= 60 ? "positive" : percent >= 40 ? "mixed" : "negative";
  const tierLabel = {
    positive: "Positive",
    mixed: "Mixed",
    negative: "Negative",
  }[tier];
  const colors = {
    positive: { bg: "#e4f1ec", fg: "#1f7a4d" },
    mixed: { bg: "#faf1d8", fg: "#9c7a1f" },
    negative: { bg: "#f7e8e2", fg: "#b1502e" },
  }[tier];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: "0.85rem",
        fontWeight: 600,
        background: colors.bg,
        color: colors.fg,
      }}
    >
      Overall Sentiment: {percent}% {tierLabel} · {reviews.length} review
      {reviews.length === 1 ? "" : "s"}
    </span>
  );
}
