import { desc, eq, count, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDb } from "../db";
import { organizations, users, companies, leads, opportunities } from "../../drizzle/schema";
import { superadminProcedure, router } from "../_core/trpc";

export const adminRouter = router({
  // ── Organizações ──────────────────────────────────────────────────────────

  organizations: router({
    list: superadminProcedure.query(async () => {
      const db = await getDb();
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
          const db = await getDb();
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
        })
      );

      return stats;
    }),
  }),

  // ── Usuários ──────────────────────────────────────────────────────────────

  users: router({
    list: superadminProcedure
      .input(z.object({ organizationId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        const rows = await db
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
              : sql`1=1`
          )
          .orderBy(organizations.nome, users.name);

        return rows;
      }),

    resetPassword: superadminProcedure
      .input(z.object({
        userId: z.number(),
        newPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        const hash = await bcrypt.hash(input.newPassword, 12);
        await db
          .update(users)
          .set({ passwordHash: hash, updatedAt: new Date() })
          .where(eq(users.id, input.userId));
        return { success: true };
      }),

    updateRole: superadminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["superadmin", "admin", "gerente", "vendedor"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        await db
          .update(users)
          .set({ role: input.role, updatedAt: new Date() })
          .where(eq(users.id, input.userId));
        return { success: true };
      }),

    toggleAtivo: superadminProcedure
      .input(z.object({ userId: z.number(), ativo: z.boolean() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        await db
          .update(users)
          .set({ ativo: input.ativo, updatedAt: new Date() })
          .where(eq(users.id, input.userId));
        return { success: true };
      }),
  }),

  // ── Stats globais ─────────────────────────────────────────────────────────

  stats: router({
    overview: superadminProcedure.query(async () => {
      const db = await getDb();
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
