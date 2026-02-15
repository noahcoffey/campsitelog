import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips } from "@/db/schema";
import { eq, desc, ilike, and, gte, lte, sql } from "drizzle-orm";
import { tripSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search");
  const tag = searchParams.get("tag");
  const startAfter = searchParams.get("startAfter");
  const startBefore = searchParams.get("startBefore");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const conditions = [eq(trips.userId, session.user.id)];

  if (search) {
    conditions.push(ilike(trips.title, `%${search}%`));
  }

  if (tag) {
    conditions.push(sql`${trips.tags} @> ${JSON.stringify([tag])}::jsonb`);
  }

  if (startAfter) {
    conditions.push(gte(trips.startDate, new Date(startAfter)));
  }

  if (startBefore) {
    conditions.push(lte(trips.startDate, new Date(startBefore)));
  }

  const [results, totalResult] = await Promise.all([
    db
      .select()
      .from(trips)
      .where(and(...conditions))
      .orderBy(desc(trips.startDate))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(trips)
      .where(and(...conditions)),
  ]);

  return NextResponse.json({
    trips: results,
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
    const parsed = tripSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const [trip] = await db
      .insert(trips)
      .values({
        userId: session.user.id,
        title: data.title,
        description: data.description,
        locationName: data.locationName,
        latitude: data.latitude?.toString(),
        longitude: data.longitude?.toString(),
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        tags: data.tags,
        campgroundId: data.campgroundId,
        rating: data.rating,
        notes: data.notes,
        isPublic: data.isPublic,
      })
      .returning();

    return NextResponse.json(trip, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
