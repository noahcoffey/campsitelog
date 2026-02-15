import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  decimal,
  integer,
  jsonb,
  boolean,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ─── Auth.js tables ──────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
);

export const passwordResets = pgTable("password_resets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Trips ───────────────────────────────────────────────────

export const trips = pgTable(
  "trips",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    locationName: varchar("location_name", { length: 255 }),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    startDate: timestamp("start_date", { mode: "date" }).notNull(),
    endDate: timestamp("end_date", { mode: "date" }),
    tags: jsonb("tags").$type<string[]>().default([]),
    campgroundId: uuid("campground_id").references(() => campgrounds.id, {
      onDelete: "set null",
    }),
    rating: integer("rating"),
    notes: text("notes"),
    isPublic: boolean("is_public").default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("trips_user_id_idx").on(table.userId),
    index("trips_start_date_idx").on(table.startDate),
  ]
);

// ─── Log Entries ─────────────────────────────────────────────

export const logEntries = pgTable(
  "log_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    entryDate: timestamp("entry_date", { mode: "date" }).notNull(),
    weather: varchar("weather", { length: 50 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("log_entries_trip_id_idx").on(table.tripId)]
);

// ─── Photos ──────────────────────────────────────────────────

export const photos = pgTable(
  "photos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    filename: varchar("filename", { length: 255 }).notNull(),
    thumbnailFilename: varchar("thumbnail_filename", { length: 255 }).notNull(),
    caption: text("caption"),
    sortOrder: integer("sort_order").default(0),
    width: integer("width"),
    height: integer("height"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("photos_trip_id_idx").on(table.tripId)]
);

// ─── Campgrounds ─────────────────────────────────────────────

export const campgrounds = pgTable(
  "campgrounds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    locationName: varchar("location_name", { length: 255 }),
    state: varchar("state", { length: 100 }),
    latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
    amenities: jsonb("amenities").$type<string[]>().default([]),
    totalSites: integer("total_sites"),
    website: varchar("website", { length: 500 }),
    phone: varchar("phone", { length: 20 }),
    reservationUrl: varchar("reservation_url", { length: 500 }),
    averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
    reviewCount: integer("review_count").default(0),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("campgrounds_state_idx").on(table.state),
    index("campgrounds_lat_lng_idx").on(table.latitude, table.longitude),
  ]
);

// ─── Campsites ───────────────────────────────────────────────

export const campsites = pgTable(
  "campsites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campgroundId: uuid("campground_id")
      .notNull()
      .references(() => campgrounds.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    siteType: varchar("site_type", { length: 50 }),
    hasElectric: boolean("has_electric").default(false),
    hasWater: boolean("has_water").default(false),
    hasSewer: boolean("has_sewer").default(false),
    maxLength: integer("max_length"),
    notes: text("notes"),
  },
  (table) => [index("campsites_campground_id_idx").on(table.campgroundId)]
);

// ─── Reviews ─────────────────────────────────────────────────

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campgroundId: uuid("campground_id")
      .notNull()
      .references(() => campgrounds.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tripId: uuid("trip_id").references(() => trips.id, {
      onDelete: "set null",
    }),
    rating: integer("rating").notNull(),
    title: varchar("title", { length: 255 }),
    content: text("content"),
    visitDate: timestamp("visit_date", { mode: "date" }),
    upvoteCount: integer("upvote_count").default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("reviews_campground_id_idx").on(table.campgroundId),
    index("reviews_user_id_idx").on(table.userId),
    uniqueIndex("reviews_user_campground_idx").on(
      table.userId,
      table.campgroundId
    ),
  ]
);

// ─── Review Upvotes ──────────────────────────────────────────

export const reviewUpvotes = pgTable(
  "review_upvotes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.reviewId] })]
);
