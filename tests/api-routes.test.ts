import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { createDbMock } from "./db-mock";

const mock = vi.hoisted(() => ({ session: null as null | { user: { id: string } } }));
const dbm = vi.hoisted(() => ({ current: null as ReturnType<typeof createDbMock> | null }));

vi.mock("@/lib/db", async () => {
  const { createDbMock } = await import("./db-mock");
  dbm.current = createDbMock();
  return { db: dbm.current.db };
});
vi.mock("@/lib/auth", () => ({ auth: vi.fn(async () => mock.session) }));
vi.mock("bcryptjs", () => ({ default: { hash: vi.fn(async () => "hashed"), compare: vi.fn() } }));

import { POST as register } from "@/app/api/auth/register/route";
import { GET as listTrips, POST as createTrip } from "@/app/api/trips/route";
import { POST as upvote } from "@/app/api/reviews/[id]/upvote/route";

const json = (url: string, body: unknown) =>
  new NextRequest(url, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } });

beforeEach(() => {
  dbm.current!.reset();
  mock.session = { user: { id: "user-1" } };
});

describe("POST /api/auth/register", () => {
  const good = { name: "Noah", email: "n@x.com", password: "Password1", confirmPassword: "Password1" };
  it("400s on invalid input", async () => {
    const res = await register(json("http://l/api/auth/register", { ...good, password: "weak" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/at least 8/);
  });
  it("409s if email exists", async () => {
    dbm.current!.queue([{ id: "x" }]);
    const res = await register(json("http://l/api/auth/register", good));
    expect(res.status).toBe(409);
  });
  it("201s and returns the new user", async () => {
    dbm.current!.queue([], [{ id: "u2", name: "Noah", email: "n@x.com" }]);
    const res = await register(json("http://l/api/auth/register", good));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "u2", name: "Noah", email: "n@x.com" });
  });
  it("500s on db failure", async () => {
    dbm.current!.queue(new Error("db down"));
    expect((await register(json("http://l/api/auth/register", good))).status).toBe(500);
  });
});

describe("/api/trips", () => {
  it("401s without a session", async () => {
    mock.session = null;
    expect((await listTrips(new NextRequest("http://l/api/trips"))).status).toBe(401);
    expect((await createTrip(json("http://l/api/trips", {}))).status).toBe(401);
  });
  it("lists trips with pagination", async () => {
    dbm.current!.queue([{ id: "t1" }], [{ count: 45 }]);
    const res = await listTrips(new NextRequest("http://l/api/trips?page=2&limit=20&search=lake&tag=rv&startAfter=2026-01-01"));
    expect(await res.json()).toEqual({ trips: [{ id: "t1" }], total: 45, page: 2, totalPages: 3 });
  });
  it("validates and creates trips", async () => {
    expect((await createTrip(json("http://l/api/trips", { title: "" }))).status).toBe(400);
    dbm.current!.queue([{ id: "t9", title: "Lake" }]);
    const res = await createTrip(json("http://l/api/trips", { title: "Lake", startDate: "2026-06-01", latitude: 40.1 }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "t9", title: "Lake" });
  });
});

describe("POST /api/reviews/[id]/upvote", () => {
  const params = { params: Promise.resolve({ id: "r1" }) };
  it("401s without a session", async () => {
    mock.session = null;
    expect((await upvote(new Request("http://l"), params)).status).toBe(401);
  });
  it("adds an upvote when none exists", async () => {
    dbm.current!.queue([]);
    expect(await (await upvote(new Request("http://l"), params)).json()).toEqual({ upvoted: true });
    expect(dbm.current!.calls).toContain("insert");
  });
  it("removes an existing upvote", async () => {
    dbm.current!.queue([{ userId: "user-1", reviewId: "r1" }]);
    expect(await (await upvote(new Request("http://l"), params)).json()).toEqual({ upvoted: false });
    expect(dbm.current!.calls).toContain("delete");
  });
});
