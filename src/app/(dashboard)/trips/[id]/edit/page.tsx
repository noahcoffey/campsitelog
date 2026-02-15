import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TripForm from "@/components/trips/TripForm";

interface EditTripPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTripPage({ params }: EditTripPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, session.user.id)))
    .limit(1);

  if (!trip) notFound();

  const initialData = {
    id: trip.id,
    title: trip.title,
    description: trip.description || "",
    locationName: trip.locationName || "",
    latitude: trip.latitude ? parseFloat(trip.latitude) : null,
    longitude: trip.longitude ? parseFloat(trip.longitude) : null,
    startDate: new Date(trip.startDate).toISOString().split("T")[0],
    endDate: trip.endDate
      ? new Date(trip.endDate).toISOString().split("T")[0]
      : "",
    tags: (trip.tags as string[]) || [],
    rating: trip.rating,
    notes: trip.notes || "",
    isPublic: trip.isPublic || false,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/trips/${trip.id}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-forest"
        >
          <ArrowLeft size={14} />
          Back to trip
        </Link>
        <h1 className="text-2xl font-bold text-bark">Edit Trip</h1>
      </div>
      <TripForm initialData={initialData} />
    </div>
  );
}
