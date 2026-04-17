import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { DatabaseUnavailableError } from "./dbPool";
import { runInTenant, runWithBypass } from "./tenantDb";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware: exige usuario autenticado e abre transacao tenant-scoped.
 * Injeta `ctx.db` com RLS aplicado ao `organizationId` do usuario.
 * Superadmin recebe bypass_rls=on (acesso cross-tenant consciente).
 */
const withTenant = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  const user = ctx.user;
  const bypass = user.role === "superadmin";
  try {
    return await runInTenant(user.organizationId, bypass, (db) =>
      next({ ctx: { ...ctx, user, db } }),
    );
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return next({ ctx: { ...ctx, user, db: undefined } });
    }
    throw err;
  }
});

export const protectedProcedure = t.procedure.use(withTenant);

/**
 * Middleware: admin (admin OU superadmin) tenant-scoped.
 */
const withAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user || (ctx.user.role !== "admin" && ctx.user.role !== "superadmin")) {
    throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  }
  const user = ctx.user;
  const bypass = user.role === "superadmin";
  try {
    return await runInTenant(user.organizationId, bypass, (db) =>
      next({ ctx: { ...ctx, user, db } }),
    );
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return next({ ctx: { ...ctx, user, db: undefined } });
    }
    throw err;
  }
});

export const adminProcedure = t.procedure.use(withAdmin);

/**
 * Middleware: superadmin com RLS em modo bypass (acesso cross-tenant).
 * Usado pelo router admin para gestao global de organizations/usuarios.
 */
const withSuperadmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "superadmin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a superadmins" });
  }
  const user = ctx.user;
  try {
    return await runWithBypass((db) => next({ ctx: { ...ctx, user, db } }));
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return next({ ctx: { ...ctx, user, db: undefined } });
    }
    throw err;
  }
});

export const superadminProcedure = t.procedure.use(withSuperadmin);
