import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  const [user] = await db
    .update(users)
    .set({ name, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))
    .returning({ id: users.id, name: users.name, email: users.email });

  return NextResponse.json(user);
}
