"use client";

import { Star, ThumbsUp, Calendar } from "lucide-react";
import { useState } from "react";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
    visitDate: Date | null;
    upvoteCount: number | null;
    createdAt: Date;
  };
  userName: string;
}

export default function ReviewCard({ review, userName }: ReviewCardProps) {
  const [upvotes, setUpvotes] = useState(review.upvoteCount || 0);
  const [upvoted, setUpvoted] = useState(false);

  const handleUpvote = async () => {
    const res = await fetch(`/api/reviews/${review.id}/upvote`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      setUpvoted(data.upvoted);
      setUpvotes((prev) => prev + (data.upvoted ? 1 : -1));
    }
  };

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < review.rating
                      ? "fill-gold text-gold"
                      : "text-border"
                  }
                />
              ))}
            </div>
            {review.title && (
              <span className="text-sm font-medium text-bark">
                {review.title}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
            <span>{userName}</span>
            <span>·</span>
            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            {review.visitDate && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Calendar size={10} />
                  Visited{" "}
                  {new Date(review.visitDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {review.content && (
        <p className="mt-3 text-sm text-text-secondary">{review.content}</p>
      )}

      <div className="mt-3">
        <button
          onClick={handleUpvote}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
            upvoted
              ? "bg-forest/10 text-forest"
              : "text-text-muted hover:bg-cream"
          }`}
        >
          <ThumbsUp size={12} />
          Helpful ({upvotes})
        </button>
      </div>
    </div>
  );
}
