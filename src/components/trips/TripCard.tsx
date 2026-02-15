import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import Badge from "@/components/ui/Badge";

interface TripCardProps {
  trip: {
    id: string;
    title: string;
    locationName: string | null;
    startDate: Date;
    endDate: Date | null;
    tags: string[] | null;
    rating: number | null;
  };
}

export default function TripCard({ trip }: TripCardProps) {
  const startDate = new Date(trip.startDate);
  const endDate = trip.endDate ? new Date(trip.endDate) : null;

  const nights = endDate
    ? Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block rounded-xl border border-border bg-white p-4 shadow-sm transition hover:border-forest/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-lg font-semibold text-bark">
            {trip.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-text-muted">
            {trip.locationName && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {trip.locationName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {endDate && (
                <>
                  {" — "}
                  {endDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </>
              )}
            </span>
            {nights !== null && (
              <Badge variant="gold">
                {nights} night{nights !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        {trip.rating && (
          <div className="flex items-center gap-0.5 text-gold">
            {Array.from({ length: trip.rating }).map((_, i) => (
              <span key={i} className="text-sm">
                ★
              </span>
            ))}
          </div>
        )}
      </div>

      {((trip.tags as string[]) || []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {((trip.tags as string[]) || []).map((tag) => (
            <Badge key={tag} variant="forest">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
