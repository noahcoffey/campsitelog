import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips, photos } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Star,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PhotoGallery from "@/components/photos/PhotoGallery";
import DeleteTripButton from "@/components/trips/DeleteTripButton";

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, session.user.id)))
    .limit(1);

  if (!trip) notFound();

  const tripPhotos = await db
    .select()
    .from(photos)
    .where(eq(photos.tripId, trip.id))
    .orderBy(asc(photos.sortOrder));

  const startDate = new Date(trip.startDate);
  const endDate = trip.endDate ? new Date(trip.endDate) : null;
  const nights = endDate
    ? Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/trips"
          className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-forest"
        >
          <ArrowLeft size={14} />
          Back to trips
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-bark">{trip.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-muted">
              {trip.locationName && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {trip.locationName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {startDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {endDate && (
                  <>
                    {" — "}
                    {endDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
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

          <div className="flex gap-2">
            <Link
              href={`/trips/${trip.id}/edit`}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-bark transition hover:bg-cream"
            >
              <Edit size={14} />
              Edit
            </Link>
            <DeleteTripButton tripId={trip.id} />
          </div>
        </div>
      </div>

      {trip.rating && (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={20}
              className={
                i < trip.rating!
                  ? "fill-gold text-gold"
                  : "text-border"
              }
            />
          ))}
        </div>
      )}

      {((trip.tags as string[]) || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {((trip.tags as string[]) || []).map((tag) => (
            <Badge key={tag} variant="forest">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {trip.description && (
        <Card>
          <h2 className="mb-2 font-heading text-lg font-semibold text-bark">
            Description
          </h2>
          <p className="whitespace-pre-wrap text-sm text-text-secondary">
            {trip.description}
          </p>
        </Card>
      )}

      {trip.notes && (
        <Card>
          <h2 className="mb-2 font-heading text-lg font-semibold text-bark">
            Notes
          </h2>
          <p className="whitespace-pre-wrap text-sm text-text-secondary">
            {trip.notes}
          </p>
        </Card>
      )}

      <Card>
        <PhotoGallery photos={tripPhotos} tripId={trip.id} />
      </Card>
    </div>
  );
}
