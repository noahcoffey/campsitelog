import { vi } from "vitest";

const METHODS = ["select", "from", "where", "limit", "offset", "orderBy", "insert", "values", "returning", "update", "set", "delete", "leftJoin", "innerJoin", "groupBy"];

// Chainable, awaitable stand-in for the drizzle query builder.
// Each awaited query resolves to the next value queued with `queue()` (default []).
export function createDbMock() {
  const results: unknown[] = [];
  const calls: string[] = [];
  const chain = (): Record<string, unknown> => {
    const c: Record<string, unknown> = {};
    for (const m of METHODS) c[m] = (..._a: unknown[]) => (calls.push(m), c);
    c.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => {
      const next = results.length ? results.shift() : [];
      return (next instanceof Error ? Promise.reject(next) : Promise.resolve(next)).then(res, rej);
    };
    return c;
  };
  const db: Record<string, unknown> = {};
  for (const m of METHODS) db[m] = vi.fn((...a: unknown[]) => (chain()[m] as (...x: unknown[]) => unknown)(...a));
  return { db, calls, queue: (...v: unknown[]) => results.push(...v), reset: () => { results.length = 0; calls.length = 0; } };
}
