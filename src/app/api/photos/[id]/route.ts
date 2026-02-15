import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { photos } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { deleteUpload } from "@/lib/upload";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    const [photo] = await db
      .update(photos)
      .set({
        caption: body.caption,
        sortOrder: body.sortOrder,
      })
      .where(and(eq(photos.id, id), eq(photos.userId, session.user.id)))
      .returning();

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json(photo);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [photo] = await db
    .delete(photos)
    .where(and(eq(photos.id, id), eq(photos.userId, session.user.id)))
    .returning();

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  await deleteUpload(photo.filename, photo.thumbnailFilename);

  return NextResponse.json({ message: "Photo deleted" });
}
