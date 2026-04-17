import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { leadCadences, disqualifyReasons } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

function orgId(ctx: { user: { organizationId: number } }) {
  return ctx.user.organizationId;
}

// ============================================================================
// LEAD CADENCES ROUTER
// ============================================================================

export const leadCadencesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(leadCadences)
      .where(eq(leadCadences.organizationId, orgId(ctx)))
      .orderBy(desc(leadCadences.createdAt));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db
        .select()
        .from(leadCadences)
        .where(and(eq(leadCadences.id, input.id), eq(leadCadences.organizationId, orgId(ctx))))
        .limit(1);
      return result[0] || null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        descricao: z.string().optional(),
        stages: z.string().optional(), // JSON: [{ id, name, order }]
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      try {
        const result = await db
          .insert(leadCadences)
          .values({
            organizationId: orgId(ctx),
            nome: input.nome,
            descricao: input.descricao || null,
            stages: input.stages || "[]",
          })
          .returning();
        return result[0];
      } catch (err: any) {
        console.error("[cadences.create] DB error:", err?.message, err?.detail, err?.code);
        throw err;
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().optional(),
        descricao: z.string().optional(),
        ativa: z.boolean().optional(),
        stages: z.string().optional(), // JSON: [{ id, name, order }]
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.descricao !== undefined) updateData.descricao = data.descricao;
      if (data.ativa !== undefined) updateData.ativa = data.ativa;
      if (data.stages !== undefined) updateData.stages = data.stages;

      const result = await db
        .update(leadCadences)
        .set(updateData)
        .where(and(eq(leadCadences.id, id), eq(leadCadences.organizationId, orgId(ctx))))
        .returning();
      return result[0] || null;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .delete(leadCadences)
        .where(and(eq(leadCadences.id, input.id), eq(leadCadences.organizationId, orgId(ctx))));
      return { success: true };
    }),
});

// ============================================================================
// DISQUALIFY REASONS ROUTER
// ============================================================================

export const disqualifyReasonsRouter = router({
  list: protectedProcedure
    .input(z.object({ tipo: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions: any[] = [eq(disqualifyReasons.organizationId, orgId(ctx))];
      if (input?.tipo) {
        conditions.push(eq(disqualifyReasons.tipo, input.tipo));
      }
      return db
        .select()
        .from(disqualifyReasons)
        .where(and(...conditions))
        .orderBy(disqualifyReasons.nome);
    }),

  create: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        tipo: z.enum(["desqualificacao", "aposentamento"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db
        .insert(disqualifyReasons)
        .values({
          organizationId: orgId(ctx),
          nome: input.nome,
          tipo: input.tipo,
        })
        .returning();
      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .delete(disqualifyReasons)
        .where(and(eq(disqualifyReasons.id, input.id), eq(disqualifyReasons.organizationId, orgId(ctx))));
      return { success: true };
    }),
});
