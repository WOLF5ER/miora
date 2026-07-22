import { Star } from "lucide-react";

export default function RatingBadge({
  rating,
  reviewsCount,
  size = "sm",
}: {
  rating: number;
  reviewsCount?: number;
  size?: "sm" | "md";
}) {
  const text = size === "md" ? "text-sm" : "text-xs";
  return (
    <span className={`inline-flex items-center gap-1 ${text} text-ink-soft`}>
      <Star size={size === "md" ? 14 : 12} strokeWidth={0} fill="var(--brass)" />
      <span className="font-medium text-ink">{rating.toFixed(1)}</span>
      {reviewsCount !== undefined ? <span>· {reviewsCount} отзывов</span> : null}
    </span>
  );
}
