import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews, campgrounds } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { reviewSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const [review] = await db
      .insert(reviews)
      .values({
        campgroundId: data.campgroundId,
        userId: session.user.id,
        tripId: data.tripId,
        rating: data.rating,
        title: data.title,
        content: data.content,
        visitDate: data.visitDate ? new Date(data.visitDate) : null,
      })
      .returning();

    // Update campground average rating
    await db
      .update(campgrounds)
      .set({
        averageRating: sql`(
          SELECT ROUND(AVG(rating)::numeric, 2)::text
          FROM reviews
          WHERE campground_id = ${data.campgroundId}
        )`,
        reviewCount: sql`(
          SELECT COUNT(*)::int
          FROM reviews
          WHERE campground_id = ${data.campgroundId}
        )`,
        updatedAt: new Date(),
      })
      .where(eq(campgrounds.id, data.campgroundId));

    return NextResponse.json(review, { status: 201 });
  } catch (e: unknown) {
    const message =
      e instanceof Error && e.message.includes("unique")
        ? "You have already reviewed this campground"
        : "Something went wrong";
    const status =
      e instanceof Error && e.message.includes("unique") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
