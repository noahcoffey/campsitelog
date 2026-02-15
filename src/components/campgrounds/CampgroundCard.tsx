import Link from "next/link";
import { MapPin, Star, Tent } from "lucide-react";
import Badge from "@/components/ui/Badge";

interface CampgroundCardProps {
  campground: {
    id: string;
    name: string;
    locationName: string | null;
    state: string | null;
    amenities: string[] | null;
    averageRating: string | null;
    reviewCount: number | null;
    totalSites: number | null;
  };
}

export default function CampgroundCard({ campground }: CampgroundCardProps) {
  return (
    <Link
      href={`/campgrounds/${campground.id}`}
      className="block rounded-xl border border-border bg-white p-4 shadow-sm transition hover:border-forest/30 hover:shadow-md"
    >
      <h3 className="font-heading text-lg font-semibold text-bark">
        {campground.name}
      </h3>

      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        {campground.locationName && (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {campground.locationName}
            {campground.state && `, ${campground.state}`}
          </span>
        )}
        {campground.totalSites && (
          <span className="flex items-center gap-1">
            <Tent size={14} />
            {campground.totalSites} sites
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {((campground.amenities as string[]) || []).slice(0, 3).map((a) => (
            <Badge key={a} variant="forest">
              {a}
            </Badge>
          ))}
        </div>

        {campground.averageRating && (
          <div className="flex items-center gap-1 text-sm">
            <Star size={14} className="fill-gold text-gold" />
            <span className="font-medium text-bark">
              {parseFloat(campground.averageRating).toFixed(1)}
            </span>
            <span className="text-text-muted">
              ({campground.reviewCount})
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
