import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { DatabaseUnavailableError } from "../_core/dbPool";
import { runWithBypass } from "../_core/tenantDb";
import { users, organizations } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const authRouter = router({
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    const user = ctx.user;
    try {
      const org = await runWithBypass(async (db) =>
        db
          .select()
          .from(organizations)
          .where(eq(organizations.id, user.organizationId))
          .limit(1),
      );
      return { ...user, organization: org[0] || null };
    } catch (err) {
      if (err instanceof DatabaseUnavailableError) {
        return user;
      }
      throw err;
    }
  }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  /**
   * Get all users in the same organization (admin/org-admin only)
   */
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    const db = ctx.db;
    if (!db) return [];
    return db.select().from(users).where(eq(users.organizationId, ctx.user.organizationId)).orderBy(users.name);
  }),

  /**
   * Update user role (admin/org-admin only, same org)
   */
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["admin", "gerente", "vendedor"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isOrgAdmin && ctx.user.role !== "admin" && ctx.user.role !== "superadmin") {
        throw new Error("Apenas administradores podem alterar papéis");
      }
      const db = ctx.db;
      if (!db) throw new Error("Database not available");
      await db
        .update(users)
        .set({ role: input.role })
        .where(and(eq(users.id, input.userId), eq(users.organizationId, ctx.user.organizationId)));
      return { success: true };
    }),

  /**
   * Deactivate user (admin/org-admin only, same org)
   */
  deactivateUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isOrgAdmin && ctx.user.role !== "admin" && ctx.user.role !== "superadmin") {
        throw new Error("Apenas administradores podem desativar usuários");
      }
      const db = ctx.db;
      if (!db) throw new Error("Database not available");
      await db
        .update(users)
        .set({ ativo: false })
        .where(and(eq(users.id, input.userId), eq(users.organizationId, ctx.user.organizationId)));
      return { success: true };
    }),

  /**
   * Activate user (admin/org-admin only, same org)
   */
  activateUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isOrgAdmin && ctx.user.role !== "admin" && ctx.user.role !== "superadmin") {
        throw new Error("Apenas administradores podem ativar usuários");
      }
      const db = ctx.db;
      if (!db) throw new Error("Database not available");
      await db
        .update(users)
        .set({ ativo: true })
        .where(and(eq(users.id, input.userId), eq(users.organizationId, ctx.user.organizationId)));
      return { success: true };
    }),

  /**
   * Get organization info for the current user
   */
  getOrganization: protectedProcedure.query(async ({ ctx }) => {
    const db = ctx.db;
    if (!db) return null;
    const result = await db.select().from(organizations).where(eq(organizations.id, ctx.user.organizationId)).limit(1);
    return result[0] || null;
  }),

  /**
   * Update organization settings (org-admin only)
   */
  /**
   * Change password for the current user
   */
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      if (!db) throw new Error("Database not available");
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user) throw new Error("Usu\u00e1rio n\u00e3o encontrado");
      const bcrypt = await import("bcryptjs");
      const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!valid) throw new Error("Senha atual incorreta");
      const newHash = await bcrypt.hash(input.newPassword, 10);
      await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  updateOrganization: protectedProcedure
    .input(z.object({
      nome: z.string().optional(),
      cnpj: z.string().optional(),
      email: z.string().email().optional(),
      telefone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isOrgAdmin && ctx.user.role !== "admin" && ctx.user.role !== "superadmin") {
        throw new Error("Apenas administradores podem editar a organização");
      }
      const db = ctx.db;
      if (!db) throw new Error("Database not available");
      await db.update(organizations).set({ ...input, updatedAt: new Date() }).where(eq(organizations.id, ctx.user.organizationId));
      return { success: true };
    }),
});
