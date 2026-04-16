import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

function orgId(ctx: { user: { organizationId: number } }) {
  return ctx.user.organizationId;
}

export const productsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(products)
      .where(eq(products.organizationId, orgId(ctx)))
      .orderBy(products.categoria, products.nome);
  }),

  create: protectedProcedure
    .input(z.object({
      nome: z.string().min(1),
      descricao: z.string().optional(),
      categoria: z.string().optional(),
      precoBase: z.string().default("0"),
      recorrencia: z.enum(["mensal", "anual", "unico", "sob_demanda"]).default("mensal"),
      unidade: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db
        .insert(products)
        .values({
          organizationId: orgId(ctx),
          nome: input.nome,
          descricao: input.descricao || null,
          categoria: input.categoria || null,
          precoBase: input.precoBase,
          recorrencia: input.recorrencia,
          unidade: input.unidade || null,
        })
        .returning();
      return result[0];
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      descricao: z.string().optional(),
      categoria: z.string().optional(),
      precoBase: z.string().optional(),
      recorrencia: z.enum(["mensal", "anual", "unico", "sob_demanda"]).optional(),
      unidade: z.string().optional(),
      ativo: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      const update: Record<string, any> = { updatedAt: new Date() };
      if (data.nome !== undefined) update.nome = data.nome;
      if (data.descricao !== undefined) update.descricao = data.descricao;
      if (data.categoria !== undefined) update.categoria = data.categoria;
      if (data.precoBase !== undefined) update.precoBase = data.precoBase;
      if (data.recorrencia !== undefined) update.recorrencia = data.recorrencia;
      if (data.unidade !== undefined) update.unidade = data.unidade;
      if (data.ativo !== undefined) update.ativo = data.ativo;
      const result = await db
        .update(products)
        .set(update)
        .where(and(eq(products.id, id), eq(products.organizationId, orgId(ctx))))
        .returning();
      return result[0] || null;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .delete(products)
        .where(and(eq(products.id, input.id), eq(products.organizationId, orgId(ctx))));
      return { success: true };
    }),
});
