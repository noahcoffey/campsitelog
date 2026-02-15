import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews, reviewUpvotes } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: reviewId } = await params;

  // Check if already upvoted
  const [existing] = await db
    .select()
    .from(reviewUpvotes)
    .where(
      and(
        eq(reviewUpvotes.userId, session.user.id),
        eq(reviewUpvotes.reviewId, reviewId)
      )
    )
    .limit(1);

  if (existing) {
    // Remove upvote
    await db
      .delete(reviewUpvotes)
      .where(
        and(
          eq(reviewUpvotes.userId, session.user.id),
          eq(reviewUpvotes.reviewId, reviewId)
        )
      );

    await db
      .update(reviews)
      .set({
        upvoteCount: sql`GREATEST(${reviews.upvoteCount} - 1, 0)`,
      })
      .where(eq(reviews.id, reviewId));

    return NextResponse.json({ upvoted: false });
  } else {
    // Add upvote
    await db.insert(reviewUpvotes).values({
      userId: session.user.id,
      reviewId,
    });

    await db
      .update(reviews)
      .set({
        upvoteCount: sql`${reviews.upvoteCount} + 1`,
      })
      .where(eq(reviews.id, reviewId));

    return NextResponse.json({ upvoted: true });
  }
}
