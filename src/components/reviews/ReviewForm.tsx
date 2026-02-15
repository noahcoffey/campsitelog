"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";

interface ReviewFormProps {
  campgroundId: string;
}

export default function ReviewForm({ campgroundId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setError("");
    setLoading(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campgroundId,
        rating,
        title: title || undefined,
        content: content || undefined,
        visitDate: visitDate || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setRating(0);
    setTitle("");
    setContent("");
    setVisitDate("");
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-danger-light px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-bark">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition"
            >
              <Star
                size={24}
                className={
                  star <= (hoverRating || rating)
                    ? "fill-gold text-gold"
                    : "text-border hover:text-gold"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <Input
        id="reviewTitle"
        label="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Summarize your experience"
      />

      <Textarea
        id="reviewContent"
        label="Your review"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tell others about your experience..."
      />

      <Input
        id="visitDate"
        label="Visit date (optional)"
        type="date"
        value={visitDate}
        onChange={(e) => setVisitDate(e.target.value)}
      />

      <Button type="submit" loading={loading}>
        <Send size={16} />
        Submit Review
      </Button>
    </form>
  );
}
