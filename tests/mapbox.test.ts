import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("mapbox geocoding", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_TOKEN", "test-token");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns [] without a token and does not fetch", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_TOKEN", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { geocodeForward, geocodeReverse } = await import("@/lib/mapbox");
    expect(await geocodeForward("x")).toEqual([]);
    expect(await geocodeReverse(1, 2)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps forward results", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          { properties: { full_address: "Yosemite, CA", context: { region: { name: "California" } } }, geometry: { coordinates: [-119.5, 37.8] } },
          { properties: { name: "Somewhere" }, geometry: { coordinates: [1, 2] } },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { geocodeForward } = await import("@/lib/mapbox");
    const r = await geocodeForward("yose mite");
    expect(fetchMock.mock.calls[0][0]).toContain("q=yose%20mite");
    expect(fetchMock.mock.calls[0][0]).toContain("access_token=test-token");
    expect(r).toEqual([
      { placeName: "Yosemite, CA", latitude: 37.8, longitude: -119.5, state: "California" },
      { placeName: "Somewhere", latitude: 2, longitude: 1, state: undefined },
    ]);
  });

  it("handles errors and reverse lookup", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ properties: { full_address: "Moab, UT" } }] }) }));
    const { geocodeForward, geocodeReverse } = await import("@/lib/mapbox");
    expect(await geocodeForward("x")).toEqual([]);
    expect(await geocodeReverse(38, -109)).toBe("Moab, UT");
  });
});
