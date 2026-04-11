import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { requireAdmin } from "../authorization";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),

  /**
   * Get all users (admin only)
   */
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx.user);
    const db = await getDb();
    if (!db) return [];
    return db.select().from(users);
  }),

  /**
   * Update user role (admin only)
   */
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["admin", "gerente", "vendedor"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  /**
   * Deactivate user (admin only)
   */
  deactivateUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(users)
        .set({ ativo: false })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  /**
   * Activate user (admin only)
   */
  activateUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(users)
        .set({ ativo: true })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),
});
