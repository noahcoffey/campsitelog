import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-compatible auth config (no Node.js dependencies)
// Used by middleware. The full config in auth.ts extends this.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const publicPaths = [
        "/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/api/auth",
      ];

      const isPublic = publicPaths.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
      );

      if (isPublic || pathname.startsWith("/_next") || pathname.includes(".")) {
        return true;
      }

      if (!isLoggedIn) {
        return false; // redirects to signIn page
      }

      return true;
    },
  },
};
