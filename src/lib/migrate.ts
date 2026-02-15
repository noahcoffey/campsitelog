import { db } from "./db";
import { sql } from "drizzle-orm";

export async function runMigrations() {
  // Create all tables if they don't exist
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255),
      email VARCHAR(255) NOT NULL UNIQUE,
      email_verified TIMESTAMP,
      image TEXT,
      password_hash TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS accounts (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(255) NOT NULL,
      provider VARCHAR(255) NOT NULL,
      provider_account_id VARCHAR(255) NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type VARCHAR(255),
      scope VARCHAR(255),
      id_token TEXT,
      session_state VARCHAR(255),
      PRIMARY KEY (provider, provider_account_id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      session_token VARCHAR(255) PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier VARCHAR(255) NOT NULL,
      token VARCHAR(255) NOT NULL,
      expires TIMESTAMP NOT NULL,
      PRIMARY KEY (identifier, token)
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS campgrounds (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      location_name VARCHAR(255),
      state VARCHAR(100),
      latitude DECIMAL(10,7) NOT NULL,
      longitude DECIMAL(10,7) NOT NULL,
      amenities JSONB DEFAULT '[]',
      total_sites INTEGER,
      website VARCHAR(500),
      phone VARCHAR(20),
      reservation_url VARCHAR(500),
      average_rating DECIMAL(3,2),
      review_count INTEGER DEFAULT 0,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS trips (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      location_name VARCHAR(255),
      latitude DECIMAL(10,7),
      longitude DECIMAL(10,7),
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP,
      tags JSONB DEFAULT '[]',
      campground_id UUID REFERENCES campgrounds(id) ON DELETE SET NULL,
      rating INTEGER,
      notes TEXT,
      is_public BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS log_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      entry_date TIMESTAMP NOT NULL,
      weather VARCHAR(50),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS photos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      filename VARCHAR(255) NOT NULL,
      thumbnail_filename VARCHAR(255) NOT NULL,
      caption TEXT,
      sort_order INTEGER DEFAULT 0,
      width INTEGER,
      height INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS campsites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campground_id UUID NOT NULL REFERENCES campgrounds(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      site_type VARCHAR(50),
      has_electric BOOLEAN DEFAULT FALSE,
      has_water BOOLEAN DEFAULT FALSE,
      has_sewer BOOLEAN DEFAULT FALSE,
      max_length INTEGER,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campground_id UUID NOT NULL REFERENCES campgrounds(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
      rating INTEGER NOT NULL,
      title VARCHAR(255),
      content TEXT,
      visit_date TIMESTAMP,
      upvote_count INTEGER DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS review_upvotes (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, review_id)
    );
  `);

  // Create indexes (IF NOT EXISTS)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS trips_user_id_idx ON trips(user_id);
    CREATE INDEX IF NOT EXISTS trips_start_date_idx ON trips(start_date);
    CREATE INDEX IF NOT EXISTS log_entries_trip_id_idx ON log_entries(trip_id);
    CREATE INDEX IF NOT EXISTS photos_trip_id_idx ON photos(trip_id);
    CREATE INDEX IF NOT EXISTS campgrounds_state_idx ON campgrounds(state);
    CREATE INDEX IF NOT EXISTS campgrounds_lat_lng_idx ON campgrounds(latitude, longitude);
    CREATE INDEX IF NOT EXISTS campsites_campground_id_idx ON campsites(campground_id);
    CREATE INDEX IF NOT EXISTS reviews_campground_id_idx ON reviews(campground_id);
    CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS reviews_user_campground_idx ON reviews(user_id, campground_id);
  `);
}
