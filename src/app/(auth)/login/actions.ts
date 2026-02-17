"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function authenticate(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/trips";

  try {
    console.log("[login] attempting signIn for:", email);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    console.log("[login] signIn result:", result);
  } catch (error) {
    console.log("[login] signIn error:", error);
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }

  console.log("[login] redirecting to:", callbackUrl);
  redirect(callbackUrl);
}
