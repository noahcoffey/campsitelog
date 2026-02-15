import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips } from "@/db/schema";
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Compass } from "lucide-react";
import TripCard from "@/components/trips/TripCard";
import TripFilters from "@/components/trips/TripFilters";

export const metadata = { title: "My Trips — CampLog" };

interface TripsPageProps {
  searchParams: Promise<{ search?: string; tag?: string; page?: string }>;
}

export default async function TripsPage({ searchParams }: TripsPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const search = params.search;
  const tag = params.tag;
  const page = parseInt(params.page || "1");
  const limit = 20;

  const conditions = [eq(trips.userId, session.user.id)];
  if (search) conditions.push(ilike(trips.title, `%${search}%`));
  if (tag)
    conditions.push(sql`${trips.tags} @> ${JSON.stringify([tag])}::jsonb`);

  const [results, totalResult, allTags] = await Promise.all([
    db
      .select()
      .from(trips)
      .where(and(...conditions))
      .orderBy(desc(trips.startDate))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(trips)
      .where(and(...conditions)),
    db
      .select({ tags: trips.tags })
      .from(trips)
      .where(eq(trips.userId, session.user.id)),
  ]);

  const total = totalResult[0].count;
  const uniqueTags = [
    ...new Set(allTags.flatMap((t) => (t.tags as string[]) || [])),
  ].sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bark">My Trips</h1>
          <p className="text-sm text-text-muted">
            {total} trip{total !== 1 ? "s" : ""} logged
          </p>
        </div>
        <Link
          href="/trips/new"
          className="inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-white transition hover:bg-forest-light"
        >
          <Plus size={16} />
          New Trip
        </Link>
      </div>

      <TripFilters
        currentSearch={search}
        currentTag={tag}
        availableTags={uniqueTags}
      />

      {results.length === 0 ? (
        <div className="rounded-xl border border-border bg-white py-16 text-center">
          <Compass className="mx-auto mb-3 text-text-muted" size={40} />
          <p className="text-text-muted">
            {search || tag ? "No trips match your filters." : "No trips yet."}
          </p>
          {!search && !tag && (
            <Link
              href="/trips/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-light"
            >
              <Plus size={16} />
              Log your first trip
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <Link
        href="/trips/new"
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-white shadow-lg transition hover:bg-forest-light sm:hidden"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
