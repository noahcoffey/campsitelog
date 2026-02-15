"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

interface TripFiltersProps {
  currentSearch?: string;
  currentTag?: string;
  availableTags: string[];
}

export default function TripFilters({
  currentSearch,
  currentTag,
  availableTags,
}: TripFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || "");

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page");
    router.push(`/trips?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: search || null });
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips..."
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
          />
        </div>
        {(currentSearch || currentTag) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              router.push("/trips");
            }}
            className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-muted hover:bg-cream"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </form>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                updateParams({ tag: currentTag === tag ? null : tag })
              }
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                currentTag === tag
                  ? "bg-forest text-white"
                  : "bg-cream text-bark hover:bg-forest/10"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
