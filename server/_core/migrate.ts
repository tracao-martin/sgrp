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
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        id serial PRIMARY KEY,
        name varchar(255) NOT NULL UNIQUE,
        applied_at timestamp NOT NULL DEFAULT now()
      )
    `;

    const migrationsDir = path.join(process.cwd(), "drizzle");
    if (!fs.existsSync(migrationsDir)) {
      console.warn("[Migrate] drizzle/ directory not found");
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql") && f !== "pg-migration.sql")
      .sort();

    const applied = await sql`SELECT name FROM _migrations`;
    const appliedNames = new Set(applied.map((r: any) => r.name));

    // On first run in an existing DB: pre-mark migrations 0000-0007 as applied
    // (they were created before this migration tracking system existed).
    // We still run 0008+ because they use IF NOT EXISTS and are safe to re-apply.
    if (applied.length === 0) {
      const hasExisting = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'users'
        ) as ok
      `;
      if (hasExisting[0].ok) {
        const legacyFiles = files.filter((f) => f < "0008_");
        for (const f of legacyFiles) {
          await sql`INSERT INTO _migrations (name) VALUES (${f}) ON CONFLICT DO NOTHING`;
          appliedNames.add(f);
        }
        console.log(`[Migrate] Existing DB: skipped ${legacyFiles.length} legacy migrations`);
      }
    }

    // Apply pending migrations statement-by-statement
    for (const file of files) {
      if (appliedNames.has(file)) continue;

      console.log(`[Migrate] Applying: ${file}`);
      const content = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      const statements = content
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);

      let ok = true;
      for (const stmt of statements) {
        try {
          await sql.unsafe(stmt + ";");
        } catch (err: any) {
          console.error(`[Migrate] Failed statement in ${file}:`, err.message);
          ok = false;
          break;
        }
      }

      if (ok) {
        await sql`INSERT INTO _migrations (name) VALUES (${file}) ON CONFLICT DO NOTHING`;
        console.log(`[Migrate] Applied: ${file}`);
      }
    }

    console.log("[Migrate] Done");
  } finally {
    await sql.end();
  }
}
