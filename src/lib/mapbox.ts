const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface GeocodingResult {
  placeName: string;
  latitude: number;
  longitude: number;
  state?: string;
}

export async function geocodeForward(
  query: string
): Promise<GeocodingResult[]> {
  if (!MAPBOX_TOKEN) return [];

  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&country=us&types=poi,place,address&limit=5&access_token=${MAPBOX_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  return (data.features || []).map(
    (f: {
      properties: {
        full_address?: string;
        name?: string;
        context?: { region?: { name?: string } };
      };
      geometry: { coordinates: [number, number] };
    }) => ({
      placeName: f.properties.full_address || f.properties.name || "",
      longitude: f.geometry.coordinates[0],
      latitude: f.geometry.coordinates[1],
      state: f.properties.context?.region?.name,
    })
  );
}

export async function geocodeReverse(
  latitude: number,
  longitude: number
): Promise<string | null> {
  if (!MAPBOX_TOKEN) return null;

  const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&types=place&limit=1&access_token=${MAPBOX_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  return data.features?.[0]?.properties?.full_address || null;
}
