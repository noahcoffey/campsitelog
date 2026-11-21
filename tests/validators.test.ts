import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, resetPasswordSchema, tripSchema, reviewSchema, campgroundSchema } from "@/lib/validators";

const uuid = "123e4567-e89b-42d3-a456-426614174000";

describe("loginSchema", () => {
  it("accepts valid input", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });
  it("rejects bad email", () => {
    const r = loginSchema.safeParse({ email: "nope", password: "x" });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].message).toBe("Invalid email address");
  });
});

describe("registerSchema", () => {
  const base = { name: "Noah", email: "a@b.com", password: "Password1", confirmPassword: "Password1" };
  it("accepts valid input", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });
  it.each([
    [{ password: "short1A", confirmPassword: "short1A" }, "Password must be at least 8 characters"],
    [{ password: "password1", confirmPassword: "password1" }, "Password must contain an uppercase letter"],
    [{ password: "Passwordx", confirmPassword: "Passwordx" }, "Password must contain a number"],
    [{ confirmPassword: "Other1234" }, "Passwords do not match"],
    [{ name: "N" }, "Name must be at least 2 characters"],
  ])("rejects %o", (override, msg) => {
    const r = registerSchema.safeParse({ ...base, ...override });
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.message)).toContain(msg);
  });
  it("reports mismatch on confirmPassword path", () => {
    const r = registerSchema.safeParse({ ...base, confirmPassword: "Other1234" });
    expect(r.error!.issues[0].path).toEqual(["confirmPassword"]);
  });
});

describe("resetPasswordSchema", () => {
  it("requires token", () => {
    expect(resetPasswordSchema.safeParse({ token: "", password: "Password1", confirmPassword: "Password1" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: "t", password: "Password1", confirmPassword: "Password1" }).success).toBe(true);
  });
});

describe("tripSchema", () => {
  it("applies defaults", () => {
    const r = tripSchema.parse({ title: "Trip", startDate: "2026-01-01" });
    expect(r.tags).toEqual([]);
    expect(r.isPublic).toBe(false);
  });
  it("validates ranges", () => {
    expect(tripSchema.safeParse({ title: "T", startDate: "x", latitude: 91 }).success).toBe(false);
    expect(tripSchema.safeParse({ title: "T", startDate: "x", longitude: -181 }).success).toBe(false);
    expect(tripSchema.safeParse({ title: "T", startDate: "x", rating: 6 }).success).toBe(false);
    expect(tripSchema.safeParse({ title: "T", startDate: "x", rating: 2.5 }).success).toBe(false);
    expect(tripSchema.safeParse({ title: "T", startDate: "x", campgroundId: "nope" }).success).toBe(false);
    expect(tripSchema.safeParse({ title: "T", startDate: "x", campgroundId: uuid, rating: 5 }).success).toBe(true);
  });
  it("requires title and start date", () => {
    expect(tripSchema.safeParse({ title: "", startDate: "x" }).error!.issues[0].message).toBe("Title is required");
    expect(tripSchema.safeParse({ title: "T", startDate: "" }).error!.issues[0].message).toBe("Start date is required");
  });
});

describe("reviewSchema", () => {
  it("validates", () => {
    expect(reviewSchema.safeParse({ campgroundId: uuid, rating: 4 }).success).toBe(true);
    expect(reviewSchema.safeParse({ campgroundId: uuid, rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ campgroundId: "x", rating: 3 }).success).toBe(false);
  });
});

describe("campgroundSchema", () => {
  const base = { name: "Camp", latitude: 40, longitude: -100 };
  it("validates", () => {
    expect(campgroundSchema.parse(base).amenities).toEqual([]);
    expect(campgroundSchema.safeParse({ ...base, website: "not a url" }).success).toBe(false);
    expect(campgroundSchema.safeParse({ ...base, website: "https://x.com" }).success).toBe(true);
    expect(campgroundSchema.safeParse({ ...base, totalSites: 0 }).success).toBe(false);
    expect(campgroundSchema.safeParse({ name: "Camp" }).success).toBe(false);
  });
});
