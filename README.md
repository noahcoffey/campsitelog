# CampLog

A mobile-first camping journal web app for tracking trips, discovering campgrounds, and sharing reviews. Built with an NPS-inspired design system.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS with custom NPS theme tokens
- **Database**: PostgreSQL 16 via Drizzle ORM
- **Auth**: Auth.js v5 (Google OAuth + email/password)
- **Photos**: Sharp for image processing, local volume storage
- **Maps**: Mapbox GL JS
- **Deployment**: Docker + Dokploy (self-hosted)

## Features

- **Trip Journal** — Log camping trips with dates, locations, tags, ratings, and notes
- **Photo Gallery** — Upload multiple photos per trip with auto-generated thumbnails and lightbox viewing
- **Campground Directory** — Browse and search campgrounds with map view
- **Reviews** — Rate and review campgrounds with upvote system
- **Location Picker** — Mapbox-powered geocoding for trip and campground locations
- **PWA** — Installable as a home screen app on mobile

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16

### Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your database URL, auth secret, etc.
npm run dev
```

The app auto-runs database migrations on startup via the instrumentation hook.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random string for session encryption |
| `AUTH_TRUST_HOST` | Set to `true` for self-hosted deployments |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL access token |
| `UPLOAD_DIR` | Photo storage directory (default: `./uploads`) |

### Database Scripts

```bash
npm run db:generate   # Generate migration files from schema
npm run db:migrate    # Run migrations
npm run db:push       # Push schema directly (dev)
npm run db:studio     # Open Drizzle Studio
```

## Deployment

The app includes a multi-stage Dockerfile optimized for production. Deploy with any Docker-compatible platform.

```bash
docker build -t camplog .
docker run -p 3000:3000 --env-file .env camplog
```

For persistent photo storage, mount a volume to `/app/uploads`.
