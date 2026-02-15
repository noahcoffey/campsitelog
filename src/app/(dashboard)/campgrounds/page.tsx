"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Plus } from "lucide-react";
import CampgroundCard from "@/components/campgrounds/CampgroundCard";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface Campground {
  id: string;
  name: string;
  locationName: string | null;
  state: string | null;
  latitude: string;
  longitude: string;
  amenities: string[] | null;
  averageRating: string | null;
  reviewCount: number | null;
  totalSites: number | null;
}

export default function CampgroundsPage() {
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchCampgrounds = async (searchQuery?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);

    const res = await fetch(`/api/campgrounds?${params}`);
    if (res.ok) {
      const data = await res.json();
      setCampgrounds(data.campgrounds);
      setTotal(data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampgrounds();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCampgrounds(search);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bark">Campgrounds</h1>
          <p className="text-sm text-text-muted">
            {total} campground{total !== 1 ? "s" : ""} in directory
          </p>
        </div>
        <Link href="/campgrounds/new">
          <Button>
            <Plus size={16} />
            Add Campground
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campgrounds..."
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-forest border-t-transparent" />
        </div>
      ) : campgrounds.length === 0 ? (
        <div className="rounded-xl border border-border bg-white py-16 text-center">
          <MapPin className="mx-auto mb-3 text-text-muted" size={40} />
          <p className="text-text-muted">
            {search ? "No campgrounds match your search." : "No campgrounds yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {campgrounds.map((cg) => (
            <CampgroundCard key={cg.id} campground={cg} />
          ))}
        </div>
      )}
    </div>
  );
}
