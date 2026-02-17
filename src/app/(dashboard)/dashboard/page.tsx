import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips, photos, reviews } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  Camera,
  Star,
  Plus,
  Calendar,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [recentTrips, tripCount, photoCount, reviewCount] = await Promise.all([
    db
      .select()
      .from(trips)
      .where(eq(trips.userId, userId))
      .orderBy(desc(trips.startDate))
      .limit(5),
    db
      .select({ count: count() })
      .from(trips)
      .where(eq(trips.userId, userId)),
    db
      .select({ count: count() })
      .from(photos)
      .where(eq(photos.userId, userId)),
    db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.userId, userId)),
  ]);

  const stats = [
    {
      label: "Total Trips",
      value: tripCount[0].count,
      icon: Compass,
      color: "text-forest",
      bg: "bg-forest/10",
    },
    {
      label: "Photos",
      value: photoCount[0].count,
      icon: Camera,
      color: "text-gold",
      bg: "bg-gold/20",
    },
    {
      label: "Reviews",
      value: reviewCount[0].count,
      icon: Star,
      color: "text-bark",
      bg: "bg-bark/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bark">
            Welcome back, {session.user.name?.split(" ")[0] || "Camper"}
          </h1>
          <p className="text-sm text-text-muted">
            Here&apos;s your camping journal at a glance.
          </p>
        </div>
        <Link
          href="/trips/new"
          className="hidden items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-white transition hover:bg-forest-light sm:inline-flex"
        >
          <Plus size={16} />
          New Trip
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <stat.icon className={stat.color} size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-bark">{stat.value}</p>
                <p className="text-xs text-text-muted">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Trips */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-bark">
            Recent Trips
          </h2>
          <Link
            href="/trips"
            className="inline-flex items-center gap-1 text-sm text-forest hover:underline"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentTrips.length === 0 ? (
          <div className="py-8 text-center">
            <Compass className="mx-auto mb-3 text-text-muted" size={32} />
            <p className="text-sm text-text-muted">No trips yet.</p>
            <Link
              href="/trips/new"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-light"
            >
              <Plus size={16} />
              Log your first trip
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTrips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="flex items-center gap-4 rounded-lg border border-border p-3 transition hover:border-forest/30 hover:bg-cream/50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-forest/10">
                  <Compass className="text-forest" size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-bark">
                    {trip.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-text-muted">
                    {trip.locationName && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {trip.locationName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(trip.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {((trip.tags as string[]) || []).slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="forest">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

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
