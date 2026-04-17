import fs from "fs";
import path from "path";
import postgres from "postgres";

export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("[Migrate] DATABASE_URL not set, skipping migrations");
    return;
  }

  const sql = postgres(databaseUrl);

  try {
    // Create tracking table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        id serial PRIMARY KEY,
        name varchar(255) NOT NULL UNIQUE,
        applied_at timestamp NOT NULL DEFAULT now()
      )
    `;

    // Find all .sql migration files (exclude pg-migration.sql)
    const migrationsDir = path.join(process.cwd(), "drizzle");
    if (!fs.existsSync(migrationsDir)) {
      console.warn("[Migrate] drizzle/ directory not found");
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql") && f !== "pg-migration.sql")
      .sort();

    // Get already applied migrations
    const applied = await sql`SELECT name FROM _migrations`;
    const appliedNames = new Set(applied.map((r: any) => r.name));

    // Apply pending migrations
    for (const file of files) {
      if (appliedNames.has(file)) continue;

      const filePath = path.join(migrationsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      try {
        await sql.unsafe(content);
        await sql`INSERT INTO _migrations (name) VALUES (${file})`;
        console.log(`[Migrate] Applied: ${file}`);
      } catch (err: any) {
        console.error(`[Migrate] Failed on ${file}:`, err.message);
      }
    }

    console.log("[Migrate] Done");
  } finally {
    await sql.end();
  }
}
