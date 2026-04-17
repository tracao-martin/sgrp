import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../drizzle/schema";

type PgClient = ReturnType<typeof postgres>;
type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("Database not available");
    this.name = "DatabaseUnavailableError";
  }
}

let _client: PgClient | null = null;
let _baseDb: DrizzleDb | null = null;

function createClient(): PgClient | null {
  if (!process.env.DATABASE_URL) return null;
  try {
    return postgres(process.env.DATABASE_URL, {
      max: Number(process.env.DB_POOL_MAX ?? 10),
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    });
  } catch (err) {
    console.warn("[Database] Failed to create pool:", err);
    return null;
  }
}

export function getPool(): PgClient | null {
  if (!_client) _client = createClient();
  return _client;
}

export function getBaseDb(): DrizzleDb | null {
  if (_baseDb) return _baseDb;
  const client = getPool();
  if (!client) return null;
  _baseDb = drizzle(client, { schema });
  return _baseDb;
}

export type BaseDb = DrizzleDb;
export type TenantTx = Parameters<Parameters<BaseDb["transaction"]>[0]>[0];
