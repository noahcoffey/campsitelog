import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews, campgrounds } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Star, MessageSquare } from "lucide-react";
import Card from "@/components/ui/Card";

export const metadata = { title: "My Reviews — CampLog" };

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userReviews = await db
    .select({
      review: reviews,
      campgroundName: campgrounds.name,
      campgroundId: campgrounds.id,
    })
    .from(reviews)
    .innerJoin(campgrounds, eq(reviews.campgroundId, campgrounds.id))
    .where(eq(reviews.userId, session.user.id))
    .orderBy(desc(reviews.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-bark">My Reviews</h1>
        <p className="text-sm text-text-muted">
          {userReviews.length} review{userReviews.length !== 1 ? "s" : ""}{" "}
          written
        </p>
      </div>

      {userReviews.length === 0 ? (
        <div className="rounded-xl border border-border bg-white py-16 text-center">
          <MessageSquare className="mx-auto mb-3 text-text-muted" size={40} />
          <p className="text-text-muted">No reviews yet.</p>
          <p className="mt-1 text-sm text-text-muted">
            Visit a{" "}
            <Link href="/campgrounds" className="text-forest hover:underline">
              campground page
            </Link>{" "}
            to leave a review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {userReviews.map(({ review, campgroundName, campgroundId }) => (
            <Card key={review.id}>
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/campgrounds/${campgroundId}`}
                    className="font-heading text-lg font-semibold text-bark hover:text-forest"
                  >
                    {campgroundName}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
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
                </div>
                <span className="text-xs text-text-muted">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.content && (
                <p className="mt-2 text-sm text-text-secondary">
                  {review.content}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
