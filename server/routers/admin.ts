import { desc, eq, count, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { organizations, users, companies, leads, opportunities } from "../../drizzle/schema";
import { superadminProcedure, router } from "../_core/trpc";
import type { TenantDb } from "../_core/tenantDb";

function requireDb(ctx: { db?: TenantDb }): TenantDb {
  if (!ctx.db) throw new Error("Database not available");
  return ctx.db;
}

export const adminRouter = router({
  // ── Organizações ──────────────────────────────────────────────────────────

  organizations: router({
    list: superadminProcedure.query(async ({ ctx }) => {
      const db = requireDb(ctx);
      const orgs = await db
        .select({
          id: organizations.id,
          nome: organizations.nome,
          slug: organizations.slug,
          email: organizations.email,
          plano: organizations.plano,
          ativo: organizations.ativo,
          maxUsuarios: organizations.maxUsuarios,
          createdAt: organizations.createdAt,
        })
        .from(organizations)
        .orderBy(desc(organizations.createdAt));

      const stats = await Promise.all(
        orgs.map(async (org) => {
          const [userCount] = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.organizationId, org.id));
          const [companyCount] = await db
            .select({ count: count() })
            .from(companies)
            .where(eq(companies.organizationId, org.id));
          const [oppCount] = await db
            .select({ count: count() })
            .from(opportunities)
            .where(eq(opportunities.organizationId, org.id));
          return {
            ...org,
            totalUsuarios: userCount.count,
            totalEmpresas: companyCount.count,
            totalOportunidades: oppCount.count,
          };
        }),
      );

      return stats;
    }),
  }),

  // ── Usuários ──────────────────────────────────────────────────────────────

  users: router({
    list: superadminProcedure
      .input(z.object({ organizationId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const db = requireDb(ctx);
        return db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            ativo: users.ativo,
            departamento: users.departamento,
            passwordHash: users.passwordHash,
            organizationId: users.organizationId,
            createdAt: users.createdAt,
            lastSignedIn: users.lastSignedIn,
            organizacaoNome: organizations.nome,
          })
          .from(users)
          .leftJoin(organizations, eq(users.organizationId, organizations.id))
          .where(
            input?.organizationId
              ? eq(users.organizationId, input.organizationId)
              : sql`1=1`,
          )
          .orderBy(organizations.nome, users.name);
      }),

    resetPassword: superadminProcedure
      .input(
        z.object({
          userId: z.number(),
          newPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const db = requireDb(ctx);
        const hash = await bcrypt.hash(input.newPassword, 12);
        await db
          .update(users)
          .set({ passwordHash: hash, updatedAt: new Date() })
          .where(eq(users.id, input.userId));
        return { success: true };
      }),

    updateRole: superadminProcedure
      .input(
        z.object({
          userId: z.number(),
          role: z.enum(["superadmin", "admin", "gerente", "vendedor"]),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const db = requireDb(ctx);
        await db
          .update(users)
          .set({ role: input.role, updatedAt: new Date() })
          .where(eq(users.id, input.userId));
        return { success: true };
      }),

    toggleAtivo: superadminProcedure
      .input(z.object({ userId: z.number(), ativo: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const db = requireDb(ctx);
        await db
          .update(users)
          .set({ ativo: input.ativo, updatedAt: new Date() })
          .where(eq(users.id, input.userId));
        return { success: true };
      }),
  }),

  // ── Stats globais ─────────────────────────────────────────────────────────

  stats: router({
    overview: superadminProcedure.query(async ({ ctx }) => {
      const db = requireDb(ctx);
      const [[orgTotal], [userTotal], [companyTotal], [leadTotal], [oppTotal]] =
        await Promise.all([
          db.select({ count: count() }).from(organizations),
          db.select({ count: count() }).from(users),
          db.select({ count: count() }).from(companies),
          db.select({ count: count() }).from(leads),
          db.select({ count: count() }).from(opportunities),
        ]);

      return {
        organizacoes: orgTotal.count,
        usuarios: userTotal.count,
        empresas: companyTotal.count,
        leads: leadTotal.count,
        oportunidades: oppTotal.count,
      };
    }),
  }),
});
