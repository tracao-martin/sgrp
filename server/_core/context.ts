import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import type { TenantDb } from "./tenantDb";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  /**
   * Tenant-scoped Drizzle instance injetada pelos middlewares protegidos
   * (protectedProcedure/adminProcedure/superadminProcedure). Dentro desses
   * handlers a transacao ja tem `app.org_id` e `app.bypass_rls` aplicados
   * via set_config, honrando as policies RLS de migration 0010.
   *
   * Em publicProcedure nao existe — use runWithBypass quando precisar.
   */
  db?: TenantDb;
};

export async function createContext(
  opts: CreateExpressContextOptions,
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
