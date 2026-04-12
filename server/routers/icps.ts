import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { icps } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

function orgId(ctx: { user: { organizationId: number } }) {
  return ctx.user.organizationId;
}

export const icpsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(icps)
      .where(eq(icps.organizationId, orgId(ctx)))
      .orderBy(desc(icps.createdAt));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db
        .select()
        .from(icps)
        .where(and(eq(icps.id, input.id), eq(icps.organizationId, orgId(ctx))))
        .limit(1);
      return result[0] || null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
        descricao: z.string().optional(),
        segmentos: z.array(z.string()).optional(),
        portes: z.array(z.string()).optional(),
        faixaReceitaMin: z.number().optional(),
        faixaReceitaMax: z.number().optional(),
        cargosDecisor: z.array(z.string()).optional(),
        localizacoes: z.array(z.string()).optional(),
        criteriosCustom: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .insert(icps)
        .values({
          organizationId: orgId(ctx),
          nome: input.nome,
          descricao: input.descricao || null,
          segmentos: input.segmentos ? JSON.stringify(input.segmentos) : null,
          portes: input.portes ? JSON.stringify(input.portes) : null,
          faixaReceitaMin: input.faixaReceitaMin?.toString() || null,
          faixaReceitaMax: input.faixaReceitaMax?.toString() || null,
          cargosDecisor: input.cargosDecisor
            ? JSON.stringify(input.cargosDecisor)
            : null,
          localizacoes: input.localizacoes
            ? JSON.stringify(input.localizacoes)
            : null,
          criteriosCustom: input.criteriosCustom
            ? JSON.stringify(input.criteriosCustom)
            : null,
        })
        .returning();
      return result[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        descricao: z.string().optional(),
        segmentos: z.array(z.string()).optional(),
        portes: z.array(z.string()).optional(),
        faixaReceitaMin: z.number().nullable().optional(),
        faixaReceitaMax: z.number().nullable().optional(),
        cargosDecisor: z.array(z.string()).optional(),
        localizacoes: z.array(z.string()).optional(),
        criteriosCustom: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
        ativo: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;
      const updateData: Record<string, any> = { updatedAt: new Date() };

      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.descricao !== undefined) updateData.descricao = data.descricao;
      if (data.segmentos !== undefined)
        updateData.segmentos = JSON.stringify(data.segmentos);
      if (data.portes !== undefined)
        updateData.portes = JSON.stringify(data.portes);
      if (data.faixaReceitaMin !== undefined)
        updateData.faixaReceitaMin = data.faixaReceitaMin?.toString() || null;
      if (data.faixaReceitaMax !== undefined)
        updateData.faixaReceitaMax = data.faixaReceitaMax?.toString() || null;
      if (data.cargosDecisor !== undefined)
        updateData.cargosDecisor = JSON.stringify(data.cargosDecisor);
      if (data.localizacoes !== undefined)
        updateData.localizacoes = JSON.stringify(data.localizacoes);
      if (data.criteriosCustom !== undefined)
        updateData.criteriosCustom = JSON.stringify(data.criteriosCustom);
      if (data.ativo !== undefined) updateData.ativo = data.ativo;

      const result = await db
        .update(icps)
        .set(updateData)
        .where(and(eq(icps.id, id), eq(icps.organizationId, orgId(ctx))))
        .returning();
      return result[0] || null;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(icps)
        .where(
          and(eq(icps.id, input.id), eq(icps.organizationId, orgId(ctx)))
        );
      return { success: true };
    }),
});
