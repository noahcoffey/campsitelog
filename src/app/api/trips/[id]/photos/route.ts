import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips, photos } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { processUpload } from "@/lib/upload";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: tripId } = await params;

  // Verify trip ownership
  const [trip] = await db
    .select({ id: trips.id })
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, session.user.id)))
    .limit(1);

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("photos") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const uploaded: (typeof photos.$inferSelect)[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue; // 10MB limit

      const result = await processUpload(file);

      const [photo] = await db
        .insert(photos)
        .values({
          tripId,
          userId: session.user.id,
          filename: result.filename,
          thumbnailFilename: result.thumbnailFilename,
          width: result.width,
          height: result.height,
          sortOrder: uploaded.length,
        })
        .returning();

      uploaded.push(photo);
    }

    return NextResponse.json(uploaded, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
