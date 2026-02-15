import { db } from "@/lib/db";
import { campgrounds, reviews, users, campsites } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Globe,
  Phone,
  Tent,
  Star,
  ExternalLink,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ReviewCard from "@/components/reviews/ReviewCard";
import ReviewForm from "@/components/reviews/ReviewForm";
import { auth } from "@/lib/auth";

interface CampgroundDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CampgroundDetailPageProps) {
  const { id } = await params;
  const [cg] = await db
    .select({ name: campgrounds.name })
    .from(campgrounds)
    .where(eq(campgrounds.id, id))
    .limit(1);
  return { title: cg ? `${cg.name} — CampLog` : "Campground — CampLog" };
}

export default async function CampgroundDetailPage({
  params,
}: CampgroundDetailPageProps) {
  const session = await auth();
  const { id } = await params;

  const [campground] = await db
    .select()
    .from(campgrounds)
    .where(eq(campgrounds.id, id))
    .limit(1);

  if (!campground) notFound();

  const [campgroundReviews, sites] = await Promise.all([
    db
      .select({
        review: reviews,
        user: { name: users.name, image: users.image },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.campgroundId, id)),
    db
      .select()
      .from(campsites)
      .where(eq(campsites.campgroundId, id)),
  ]);

  const amenityList = (campground.amenities as string[]) || [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/campgrounds"
          className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-forest"
        >
          <ArrowLeft size={14} />
          Back to campgrounds
        </Link>

        <h1 className="text-2xl font-bold text-bark">{campground.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-muted">
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
          {campground.averageRating && (
            <span className="flex items-center gap-1">
              <Star size={14} className="fill-gold text-gold" />
              {parseFloat(campground.averageRating).toFixed(1)} ({campground.reviewCount}{" "}
              review{campground.reviewCount !== 1 ? "s" : ""})
            </span>
          )}
        </div>
      </div>

      {campground.description && (
        <Card>
          <p className="whitespace-pre-wrap text-sm text-text-secondary">
            {campground.description}
          </p>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        {campground.website && (
          <a
            href={campground.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm text-bark transition hover:bg-cream"
          >
            <Globe size={14} />
            Website
            <ExternalLink size={12} />
          </a>
        )}
        {campground.reservationUrl && (
          <a
            href={campground.reservationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-forest px-3 py-2 text-sm font-medium text-white transition hover:bg-forest-light"
          >
            Reserve
            <ExternalLink size={12} />
          </a>
        )}
        {campground.phone && (
          <a
            href={`tel:${campground.phone}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm text-bark transition hover:bg-cream"
          >
            <Phone size={14} />
            {campground.phone}
          </a>
        )}
      </div>

      {amenityList.length > 0 && (
        <Card>
          <h2 className="mb-3 font-heading text-lg font-semibold text-bark">
            Amenities
          </h2>
          <div className="flex flex-wrap gap-2">
            {amenityList.map((a) => (
              <Badge key={a} variant="forest">
                {a}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {sites.length > 0 && (
        <Card>
          <h2 className="mb-3 font-heading text-lg font-semibold text-bark">
            Campsites ({sites.length})
          </h2>
          <div className="space-y-2">
            {sites.map((site) => (
              <div
                key={site.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-bark">{site.name}</p>
                  {site.siteType && (
                    <p className="text-xs text-text-muted">{site.siteType}</p>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {site.hasElectric && <Badge>Electric</Badge>}
                  {site.hasWater && <Badge>Water</Badge>}
                  {site.hasSewer && <Badge>Sewer</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 font-heading text-lg font-semibold text-bark">
          Reviews ({campgroundReviews.length})
        </h2>

        {campgroundReviews.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-muted">
            No reviews yet. Be the first!
          </p>
        ) : (
          <div className="space-y-4">
            {campgroundReviews.map(({ review, user }) => (
              <ReviewCard
                key={review.id}
                review={review}
                userName={user.name || "Anonymous"}
              />
            ))}
          </div>
        )}

        {session?.user?.id && (
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="mb-4 font-heading text-base font-semibold text-bark">
              Write a Review
            </h3>
            <ReviewForm campgroundId={campground.id} />
          </div>
        )}
      </Card>
    </div>
  );
}
