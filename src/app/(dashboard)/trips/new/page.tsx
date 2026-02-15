import TripForm from "@/components/trips/TripForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "New Trip — CampLog" };

export default function NewTripPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/trips"
          className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-forest"
        >
          <ArrowLeft size={14} />
          Back to trips
        </Link>
        <h1 className="text-2xl font-bold text-bark">Log a New Trip</h1>
      </div>
      <TripForm />
    </div>
  );
}
