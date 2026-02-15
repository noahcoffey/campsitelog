import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campgrounds, reviews, campsites } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [campground] = await db
    .select()
    .from(campgrounds)
    .where(eq(campgrounds.id, id))
    .limit(1);

  if (!campground) {
    return NextResponse.json(
      { error: "Campground not found" },
      { status: 404 }
    );
  }

  const [campgroundReviews, campgroundSites] = await Promise.all([
    db.select().from(reviews).where(eq(reviews.campgroundId, id)),
    db.select().from(campsites).where(eq(campsites.campgroundId, id)),
  ]);

  return NextResponse.json({
    ...campground,
    reviews: campgroundReviews,
    sites: campgroundSites,
  });
}
