"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onSelect: (lat: number, lng: number, name?: string) => void;
}

interface SearchResult {
  placeName: string;
  latitude: number;
  longitude: number;
}

export default function LocationPicker({ onSelect }: LocationPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);

    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        setResults([]);
        return;
      }

      const res = await fetch(
        `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&country=us&types=poi,place,address&limit=5&access_token=${token}`
      );
      const data = await res.json();

      setResults(
        (data.features || []).map(
          (f: {
            properties: { full_address?: string; name?: string };
            geometry: { coordinates: [number, number] };
          }) => ({
            placeName: f.properties.full_address || f.properties.name || "",
            longitude: f.geometry.coordinates[0],
            latitude: f.geometry.coordinates[1],
          })
        )
      );
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-cream/50 p-4">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="Search for a location..."
          className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-forest"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="rounded-lg bg-forest px-3 py-2 text-white hover:bg-forest-light disabled:opacity-50"
        >
          <Search size={16} />
        </button>
      </div>

      {results.length > 0 && (
        <ul className="mt-3 space-y-1">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => onSelect(r.latitude, r.longitude, r.placeName)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-bark transition hover:bg-white"
              >
                <MapPin size={14} className="flex-shrink-0 text-forest" />
                <span className="truncate">{r.placeName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
