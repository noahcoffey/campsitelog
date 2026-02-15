import Link from "next/link";
import {
  Trees,
  Compass,
  Camera,
  MapPin,
  Star,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest text-white">
              <Trees size={20} />
            </div>
            <span className="font-heading text-xl font-bold text-forest">
              CampLog
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-bark hover:text-forest"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white transition hover:bg-forest-light"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-forest text-white">
            <Trees size={40} />
          </div>
          <h1 className="mx-auto max-w-2xl font-heading text-4xl font-bold leading-tight text-bark sm:text-5xl">
            Your camping adventures,{" "}
            <span className="text-forest">beautifully journaled</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-muted">
            Track your camping trips, upload photos, discover campgrounds, and
            share reviews with fellow outdoor enthusiasts.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-forest px-6 py-3 text-base font-medium text-white transition hover:bg-forest-light"
            >
              Start Your Journal
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-base font-medium text-bark transition hover:bg-cream"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold text-bark">
            Everything for your outdoor life
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Compass,
                title: "Trip Journal",
                desc: "Log every camping trip with dates, locations, notes, and star ratings.",
              },
              {
                icon: Camera,
                title: "Photo Gallery",
                desc: "Upload and organize photos from your adventures with auto-thumbnails.",
              },
              {
                icon: MapPin,
                title: "Campground Directory",
                desc: "Discover campgrounds, view amenities, and plan your next trip.",
              },
              {
                icon: Star,
                title: "Reviews & Ratings",
                desc: "Share your experiences and help fellow campers find great spots.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-forest/10">
                  <feature.icon className="text-forest" size={20} />
                </div>
                <h3 className="mb-1 font-heading text-lg font-semibold text-bark">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-white py-20">
        <div className="mx-auto max-w-xl px-4 text-center">
          <h2 className="font-heading text-3xl font-bold text-bark">
            Ready to hit the trail?
          </h2>
          <p className="mt-3 text-text-muted">
            Create your free account and start logging your camping adventures
            today.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-base font-semibold text-bark transition hover:bg-gold-light"
          >
            Get Started — It&apos;s Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} CampLog. Happy camping!</p>
        </div>
      </footer>
    </div>
  );
}
