import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { campgrounds } from "@/db/schema";
import { ilike, and, eq, sql } from "drizzle-orm";
import { campgroundSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search");
  const state = searchParams.get("state");
  const bounds = searchParams.get("bounds"); // sw_lng,sw_lat,ne_lng,ne_lat
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const conditions = [];

  if (search) {
    conditions.push(ilike(campgrounds.name, `%${search}%`));
  }

  if (state) {
    conditions.push(eq(campgrounds.state, state));
  }

  if (bounds) {
    const [swLng, swLat, neLng, neLat] = bounds.split(",").map(Number);
    conditions.push(
      sql`${campgrounds.longitude}::numeric >= ${swLng}`,
      sql`${campgrounds.latitude}::numeric >= ${swLat}`,
      sql`${campgrounds.longitude}::numeric <= ${neLng}`,
      sql`${campgrounds.latitude}::numeric <= ${neLat}`
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [results, totalResult] = await Promise.all([
    db
      .select()
      .from(campgrounds)
      .where(where)
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(campgrounds)
      .where(where),
  ]);

  return NextResponse.json({
    campgrounds: results,
    total: totalResult[0].count,
    page,
    totalPages: Math.ceil(totalResult[0].count / limit),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = campgroundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const [campground] = await db
      .insert(campgrounds)
      .values({
        name: data.name,
        description: data.description,
        locationName: data.locationName,
        state: data.state,
        latitude: data.latitude.toString(),
        longitude: data.longitude.toString(),
        amenities: data.amenities,
        totalSites: data.totalSites,
        website: data.website,
        phone: data.phone,
        reservationUrl: data.reservationUrl,
        createdBy: session.user.id,
      })
      .returning();

    return NextResponse.json(campground, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
