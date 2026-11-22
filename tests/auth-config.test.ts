import { describe, it, expect } from "vitest";
import { authConfig } from "@/lib/auth.config";

type AuthorizedArgs = Parameters<NonNullable<NonNullable<typeof authConfig.callbacks>["authorized"]>>[0];
const authorized = (pathname: string, loggedIn: boolean) =>
  authConfig.callbacks!.authorized!({
    auth: loggedIn ? { user: { id: "u1" }, expires: "" } : null,
    request: { nextUrl: new URL(`http://localhost${pathname}`) },
  } as unknown as AuthorizedArgs);

describe("authorized callback", () => {
  it.each(["/", "/login", "/register", "/forgot-password", "/reset-password", "/api/auth/session", "/_next/static/x.js", "/favicon.ico"])(
    "allows public path %s when logged out",
    async (p) => expect(await authorized(p, false)).toBe(true)
  );
  it.each(["/dashboard", "/trips/123", "/api/trips", "/loginx"])("blocks %s when logged out", async (p) => {
    expect(await authorized(p, false)).toBe(false);
  });
  it("allows protected path when logged in", async () => {
    expect(await authorized("/dashboard", true)).toBe(true);
  });
});

describe("jwt/session callbacks", () => {
  it("copies user id into token and session", async () => {
    const cb = authConfig.callbacks!;
    const token = await cb.jwt!({ token: {}, user: { id: "u1" } } as never);
    expect(token).toMatchObject({ id: "u1" });
    const session = await cb.session!({ session: { user: {} }, token } as never);
    expect((session as { user: { id: string } }).user.id).toBe("u1");
  });
  it("uses JWT sessions and custom pages", () => {
    expect(authConfig.session?.strategy).toBe("jwt");
    expect(authConfig.pages?.signIn).toBe("/login");
  });
});
