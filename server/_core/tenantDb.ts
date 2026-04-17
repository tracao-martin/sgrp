import { sql } from "drizzle-orm";
import { DatabaseUnavailableError, getBaseDb, type TenantTx } from "./dbPool";

export type TenantDb = TenantTx;

/**
 * Executa um callback dentro de uma transacao com RLS aplicado ao tenant.
 *
 * Contrato com Postgres (migration 0010_row_level_security):
 *   - `app.org_id`   : usado pela policy tenant_isolation
 *   - `app.bypass_rls`: quando 'on', policy permite acesso cross-tenant
 *
 * set_config(..., is_local=true) limita o setting a transacao.
 *
 * @throws Error quando DATABASE_URL nao esta configurado.
 */
export async function runInTenant<T>(
  orgId: number,
  bypassRls: boolean,
  cb: (db: TenantDb) => Promise<T>,
): Promise<T> {
  const db = getBaseDb();
  if (!db) throw new DatabaseUnavailableError();
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.org_id', ${String(orgId)}, true)`);
    await tx.execute(
      sql`SELECT set_config('app.bypass_rls', ${bypassRls ? "on" : "off"}, true)`,
    );
    return cb(tx);
  });
}

/**
 * Executa um callback com RLS bypass (superadmin ou auth boundary).
 *
 * Usado apenas em:
 *   - fluxos de login/register (antes de haver tenant context)
 *   - router admin (superadminProcedure)
 *
 * @throws Error quando DATABASE_URL nao esta configurado.
 */
export async function runWithBypass<T>(
  cb: (db: TenantDb) => Promise<T>,
): Promise<T> {
  const db = getBaseDb();
  if (!db) throw new DatabaseUnavailableError();
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.bypass_rls', 'on', true)`);
    return cb(tx);
  });
}
