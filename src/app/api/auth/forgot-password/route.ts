import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Always return success to prevent email enumeration
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user) {
      const token = uuidv4();
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResets).values({
        userId: user.id,
        token,
        expires,
      });

      // TODO: Send email with reset link
      // For now, log the token in dev
      if (process.env.NODE_ENV === "development") {
        console.log(`Password reset link: /reset-password?token=${token}`);
      }
    }

    return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
