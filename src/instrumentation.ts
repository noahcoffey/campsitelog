export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runMigrations } = await import("@/lib/migrate");
    try {
      await runMigrations();
      console.log("Database migrations completed successfully");
    } catch (error) {
      console.error("Database migration failed:", error);
    }
  }
}
