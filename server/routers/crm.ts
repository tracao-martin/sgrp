import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { requirePermission, requireResourceAccess, requireManagerOrAdmin } from "../authorization";
import { getDb } from "../db";
import {
  companies,
  contacts,
  leads,
  activities,
  opportunities,
  users,
  pipelineStages,
  tasks,
  icps,
  accountContacts,
} from "../../drizzle/schema";
import { icpsRouter } from "./icps";
import { leadCadencesRouter, disqualifyReasonsRouter } from "./cadences";
import { accountContactsRouter } from "./accountContacts";
import { eq, desc, and, asc, lte, inArray, gt, or, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Helper to get orgId from context user
function orgId(ctx: { user: { organizationId: number } }) {
  return ctx.user.organizationId;
}

// ============================================================================
// COMPANIES
// ============================================================================

export const companiesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["ativa", "inativa", "prospect"]).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) return [];

      const conditions: any[] = [eq(companies.organizationId, orgId(ctx))];

      if (ctx.user.role === "vendedor") {
        conditions.push(eq(companies.responsavel_id, ctx.user.id));
      }
      if (input.status) {
        conditions.push(eq(companies.status, input.status));
      }

      return db.select().from(companies).where(and(...conditions)).orderBy(desc(companies.updatedAt)).limit(input.limit);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(companies)
        .where(and(eq(companies.id, input.id), eq(companies.organizationId, orgId(ctx))))
        .limit(1);

      if (!result[0]) return null;

      if (ctx.user.role === "vendedor" && result[0].responsavel_id !== ctx.user.id) {
        throw new Error("Acesso negado");
      }

      return result[0];
    }),

  create: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        cnpj: z.string().optional(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        website: z.string().optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        pais: z.string().optional(),
        segmento: z.string().optional(),
        tamanho: z.enum(["micro", "pequena", "media", "grande", "multinacional"]).optional(),
        receita_anual: z.number().optional(),
        status: z.enum(["ativa", "inativa", "prospect"]).optional(),
        icp_id: z.number().optional(),
        lead_source: z.string().optional(),
        site: z.string().optional(),
        linkedin: z.string().optional(),
        notes: z.string().optional(),
        primary_contact_id: z.number().optional(),
        primary_contact_name: z.string().optional(),
        account_type: z.enum(["cliente_ativo", "cliente_inativo", "prospect"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(companies).values({
        ...input,
        organizationId: orgId(ctx),
        responsavel_id: ctx.user.id,
      } as any);
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        website: z.string().optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        pais: z.string().optional(),
        segmento: z.string().optional(),
        tamanho: z.enum(["micro", "pequena", "media", "grande", "multinacional"]).optional(),
        receita_anual: z.number().optional(),
        status: z.enum(["ativa", "inativa", "prospect"]).optional(),
        icp_id: z.number().nullable().optional(),
        lead_source: z.string().optional(),
        site: z.string().optional(),
        linkedin: z.string().optional(),
        notes: z.string().optional(),
        primary_contact_id: z.number().nullable().optional(),
        primary_contact_name: z.string().optional(),
        account_type: z.enum(["cliente_ativo", "cliente_inativo", "prospect"]).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const company = await db
        .select()
        .from(companies)
        .where(and(eq(companies.id, input.id), eq(companies.organizationId, orgId(ctx))))
        .limit(1);

      if (!company[0]) throw new Error("Empresa não encontrada");
      requireResourceAccess(ctx.user, company[0].responsavel_id || 0);

      const { id, ...updateData } = input;
      await db.update(companies).set(updateData as any).where(and(eq(companies.id, id), eq(companies.organizationId, orgId(ctx))));

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(companies).where(and(eq(companies.id, input.id), eq(companies.organizationId, orgId(ctx))));
      return { success: true };
    }),
});

// ============================================================================
// CONTACTS
// ============================================================================

export const contactsRouter = router({
  list: protectedProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ ctx }) => {
      requirePermission(ctx.user, "manage_contacts");
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(contacts).where(eq(contacts.organizationId, orgId(ctx))).orderBy(desc(contacts.createdAt));
      // Enrich with company name
      const companyIds = Array.from(new Set(rows.map(r => r.company_id).filter(Boolean)));
      let companyMap = new Map<number, string>();
      if (companyIds.length > 0) {
        const companiesList = await db.select().from(companies).where(eq(companies.organizationId, orgId(ctx)));
        companyMap = new Map(companiesList.map(c => [c.id, c.nome]));
      }
      return rows.map(r => ({
        ...r,
        empresa: companyMap.get(r.company_id) || null,
      }));
    }),

  listByCompany: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_contacts");
      const db = await getDb();
      if (!db) return [];
      return db.select().from(contacts).where(
        and(eq(contacts.company_id, input.companyId), eq(contacts.organizationId, orgId(ctx)))
      );
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_contacts");
      const db = await getDb();
      if (!db) return null;
      const result = await db
        .select()
        .from(contacts)
        .where(and(eq(contacts.id, input.id), eq(contacts.organizationId, orgId(ctx))))
        .limit(1);
      if (!result[0]) return null;
      // Enrich with company name
      let empresa: string | null = null;
      if (result[0].company_id) {
        const comp = await db.select().from(companies).where(and(eq(companies.id, result[0].company_id), eq(companies.organizationId, orgId(ctx)))).limit(1);
        empresa = comp[0]?.nome || null;
      }
      return { ...result[0], empresa };
    }),

  create: protectedProcedure
    .input(
      z.object({
        company_id: z.number(),
        nome: z.string().min(1),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        cargo: z.string().optional(),
        departamento: z.string().optional(),
        linkedin: z.string().optional(),
        principal: z.boolean().optional(),
        papel: z.enum(["decisor", "influenciador", "champion", "usuario", "tecnico", "outro"]).optional(),
        notas: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_contacts");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(contacts).values({
        ...input,
        organizationId: orgId(ctx),
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        cargo: z.string().optional(),
        departamento: z.string().optional(),
        linkedin: z.string().optional(),
        principal: z.boolean().optional(),
        papel: z.enum(["decisor", "influenciador", "champion", "usuario", "tecnico", "outro"]).nullable().optional(),
        notas: z.string().optional(),
        company_id: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_contacts");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updateData } = input;
      await db.update(contacts).set(updateData).where(and(eq(contacts.id, id), eq(contacts.organizationId, orgId(ctx))));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_contacts");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(contacts).where(and(eq(contacts.id, input.id), eq(contacts.organizationId, orgId(ctx))));
      return { success: true };
    }),
});

// ============================================================================
// LEADS
// ============================================================================

export const leadsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        qualificacao: z.string().optional(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) return [];

      const conditions: any[] = [eq(leads.organizationId, orgId(ctx))];

      if (ctx.user.role === "vendedor") {
        conditions.push(eq(leads.responsavel_id, ctx.user.id));
      }
      if (input.status) {
        conditions.push(eq(leads.status, input.status as any));
      }
      if (input.qualificacao) {
        conditions.push(eq(leads.qualificacao, input.qualificacao as any));
      }

      return db.select().from(leads).where(and(...conditions)).orderBy(desc(leads.updatedAt)).limit(input.limit);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) return null;
      const result = await db
        .select()
        .from(leads)
        .where(and(eq(leads.id, input.id), eq(leads.organizationId, orgId(ctx))))
        .limit(1);
      if (!result[0]) return null;
      if (ctx.user.role === "vendedor" && result[0].responsavel_id !== ctx.user.id) {
        throw new Error("Acesso negado");
      }
      return result[0];
    }),

  create: protectedProcedure
    .input(
      z.object({
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        company_id: z.number().optional(),
        contact_id: z.number().optional(),
        origem: z.string().optional(),
        qualificacao: z.enum(["frio", "morno", "quente", "qualificado"]).optional(),
        valor_estimado: z.number().optional(),
        telefone: z.string().optional(),
        email: z.string().optional(),
        cargo: z.string().optional(),
        empresa: z.string().optional(),
        linkedin: z.string().optional(),
        site: z.string().optional(),
        cpf_cnpj: z.string().optional(),
        setor: z.string().optional(),
        regiao: z.string().optional(),
        porte: z.string().optional(),
        icp_id: z.number().optional(),
        cadencia: z.string().optional(),
        fase_cadencia: z.string().optional(),
        notas: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(leads).values({
        ...input,
        organizationId: orgId(ctx),
        responsavel_id: ctx.user.id,
      } as any).returning();
      return result[0] || { success: true };
    }),

  updateQualification: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        qualificacao: z.enum(["frio", "morno", "quente", "qualificado"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(leads)
        .set({ qualificacao: input.qualificacao })
        .where(and(eq(leads.id, input.id), eq(leads.organizationId, orgId(ctx))));
      return { success: true };
    }),

  convertToOpportunity: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        opportunityTitle: z.string(),
        valor: z.number(),
        stageId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(leads)
        .set({ status: "convertido" as any, data_conversao: new Date() })
        .where(and(eq(leads.id, input.leadId), eq(leads.organizationId, orgId(ctx))));
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        origem: z.string().optional(),
        qualificacao: z.enum(["frio", "morno", "quente", "qualificado"]).optional(),
        valor_estimado: z.number().optional(),
        status: z.enum(["novo", "contatado", "qualificado", "desqualificado", "convertido", "aposentado"]).optional(),
        telefone: z.string().optional(),
        email: z.string().optional(),
        cargo: z.string().optional(),
        empresa: z.string().optional(),
        linkedin: z.string().optional(),
        site: z.string().optional(),
        cpf_cnpj: z.string().optional(),
        setor: z.string().optional(),
        regiao: z.string().optional(),
        porte: z.string().optional(),
        icp_id: z.number().nullable().optional(),
        cadencia: z.string().nullable().optional(),
        fase_cadencia: z.string().nullable().optional(),
        notas: z.string().optional(),
        motivo_desqualificacao: z.string().nullable().optional(),
        cadencia_id: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updateData } = input;
      await db.update(leads).set({ ...updateData, updatedAt: new Date() } as any).where(and(eq(leads.id, id), eq(leads.organizationId, orgId(ctx))));
      return { success: true };
    }),

  bulkUpdate: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.number()).min(1),
        status: z.string().optional(),
        qualificacao: z.enum(["frio", "morno", "quente", "qualificado"]).optional(),
        cadencia: z.string().nullable().optional(),
        cadencia_id: z.number().nullable().optional(),
        fase_cadencia: z.string().nullable().optional(),
        responsavel_id: z.number().nullable().optional(),
        origem: z.string().optional(),
        setor: z.string().optional(),
        regiao: z.string().optional(),
        porte: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { ids, ...updateData } = input;
      const cleanData: Record<string, any> = { updatedAt: new Date() };
      for (const [key, val] of Object.entries(updateData)) {
        if (val !== undefined) cleanData[key] = val;
      }
      let updated = 0;
      for (const id of ids) {
        await db.update(leads).set(cleanData as any).where(and(eq(leads.id, id), eq(leads.organizationId, orgId(ctx))));
        updated++;
      }
      return { success: true, updated };
    }),

  bulkCreate: protectedProcedure
    .input(
      z.object({
        leads: z.array(
          z.object({
            titulo: z.string().min(1),
            telefone: z.string().optional(),
            email: z.string().optional(),
            cargo: z.string().optional(),
            empresa: z.string().optional(),
            origem: z.string().optional(),
            setor: z.string().optional(),
            regiao: z.string().optional(),
            porte: z.string().optional(),
            linkedin: z.string().optional(),
            site: z.string().optional(),
            cpf_cnpj: z.string().optional(),
            notas: z.string().optional(),
            qualificacao: z.enum(["frio", "morno", "quente", "qualificado"]).optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let created = 0;
      const errors: { row: number; error: string }[] = [];
      for (let i = 0; i < input.leads.length; i++) {
        try {
          await db.insert(leads).values({
            ...input.leads[i],
            organizationId: orgId(ctx),
            responsavel_id: ctx.user.id,
          } as any);
          created++;
        } catch (e: any) {
          errors.push({ row: i + 1, error: e.message || "Erro desconhecido" });
        }
      }
      return { success: true, created, errors };
    }),

  // Move lead to a different cadence phase + log activity
  moveCadencePhase: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        faseAnterior: z.string(),
        faseNova: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Update lead's cadence phase
      await db
        .update(leads)
        .set({ fase_cadencia: input.faseNova, updatedAt: new Date() } as any)
        .where(and(eq(leads.id, input.leadId), eq(leads.organizationId, orgId(ctx))));

      // Log the activity in the activities table
      await db.insert(activities).values({
        organizationId: orgId(ctx),
        lead_id: input.leadId,
        tipo: "outro" as any,
        titulo: `Movido na cadência: ${input.faseAnterior} → ${input.faseNova}`,
        descricao: `Lead movido de "${input.faseAnterior}" para "${input.faseNova}" por ${ctx.user.name || "Usuário"}`,
        usuario_id: ctx.user.id,
        data_atividade: new Date(),
      } as any);

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(leads).where(and(eq(leads.id, input.id), eq(leads.organizationId, orgId(ctx))));
      return { success: true };
    }),
});

// ============================================================================
// ACTIVITIES (Timeline)
// ============================================================================

export const activitiesRouter = router({
  getByOpportunity: protectedProcedure
    .input(z.object({ opportunityId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(activities)
        .where(and(eq(activities.opportunity_id, input.opportunityId), eq(activities.organizationId, orgId(ctx))))
        .orderBy(desc(activities.data_atividade));
    }),

  getByContact: protectedProcedure
    .input(z.object({ contactId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(activities)
        .where(and(eq(activities.contact_id, input.contactId), eq(activities.organizationId, orgId(ctx))))
        .orderBy(desc(activities.data_atividade));
    }),

  getByLead: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(activities)
        .where(and(eq(activities.lead_id, input.leadId), eq(activities.organizationId, orgId(ctx))))
        .orderBy(desc(activities.data_atividade));
    }),

  create: protectedProcedure
    .input(
      z.object({
        tipo: z.enum(["email", "chamada", "reuniao", "nota", "proposta", "whatsapp", "visita", "outro"]),
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        status: z.enum(["pendente", "realizada"]).default("realizada"),
        data_agendada: z.string().optional(),
        opportunity_id: z.number().optional(),
        contact_id: z.number().optional(),
        company_id: z.number().optional(),
        lead_id: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { data_agendada, ...rest } = input;
      await db.insert(activities).values({
        ...rest,
        organizationId: orgId(ctx),
        usuario_id: ctx.user.id,
        data_atividade: new Date(),
        data_agendada: data_agendada ? new Date(data_agendada) : null,
      } as any);
      return { success: true };
    }),

  list: protectedProcedure
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(activities).where(eq(activities.organizationId, orgId(ctx))).orderBy(desc(activities.data_atividade));
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tipo: z.enum(["email", "chamada", "reuniao", "nota", "proposta", "whatsapp", "visita", "outro"]).optional(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        status: z.enum(["pendente", "realizada"]).optional(),
        data_agendada: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, data_agendada, ...rest } = input;
      const updateData: any = { ...rest };
      if (data_agendada !== undefined) {
        updateData.data_agendada = data_agendada ? new Date(data_agendada) : null;
      }
      await db.update(activities).set(updateData).where(and(eq(activities.id, id), eq(activities.organizationId, orgId(ctx))));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(activities).where(and(eq(activities.id, input.id), eq(activities.organizationId, orgId(ctx))));
      return { success: true };
    }),
});

// ============================================================================
// PIPELINE STAGES
// ============================================================================

export const pipelineStagesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(pipelineStages).where(eq(pipelineStages.organizationId, orgId(ctx))).orderBy(asc(pipelineStages.ordem));
  }),
});

// ============================================================================
// OPPORTUNITIES (Deals)
// ============================================================================

export const opportunitiesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        stage_id: z.number().optional(),
        status: z.string().optional(),
        responsavel_id: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions: any[] = [eq(opportunities.organizationId, orgId(ctx))];
      if (input?.stage_id) conditions.push(eq(opportunities.stage_id, input.stage_id));
      if (input?.status) conditions.push(eq(opportunities.status, input.status as any));

      const deals = await db.select().from(opportunities).where(and(...conditions)).orderBy(desc(opportunities.createdAt));

      // Compute em_risco: open deals with no pending future activity
      const openIds = deals.filter((d) => d.status === "aberta").map((d) => d.id);
      let dealsWithNextStep = new Set<number>();
      if (openIds.length > 0) {
        const now = new Date();
        const pending = await db
          .select({ opportunityId: activities.opportunity_id })
          .from(activities)
          .where(
            and(
              eq(activities.organizationId, orgId(ctx)),
              eq(activities.status as any, "pendente"),
              inArray(activities.opportunity_id as any, openIds)
            )
          );
        pending.forEach((r) => { if (r.opportunityId) dealsWithNextStep.add(r.opportunityId); });
      }

      return deals.map((deal) => ({
        ...deal,
        em_risco: deal.status === "aberta" && !dealsWithNextStep.has(deal.id),
      }));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(opportunities).where(
        and(eq(opportunities.id, input.id), eq(opportunities.organizationId, orgId(ctx)))
      ).limit(1);
      return result[0] || null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        company_id: z.number(),
        contact_id: z.number(),
        lead_id: z.number().optional(),
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        valor: z.string(),
        stage_id: z.number(),
        data_fechamento_prevista: z.string().optional(),
        probabilidade: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get stage probability for auto-probability
      const stage = await db.select().from(pipelineStages).where(
        and(eq(pipelineStages.id, input.stage_id), eq(pipelineStages.organizationId, orgId(ctx)))
      ).limit(1);
      const probAuto = stage[0]?.probabilidade_fechamento ?? 0;

      await db.insert(opportunities).values({
        ...input,
        organizationId: orgId(ctx),
        data_fechamento_prevista: input.data_fechamento_prevista ? new Date(input.data_fechamento_prevista) : undefined,
        responsavel_id: ctx.user.id,
        status: "aberta",
        probabilidadeAuto: probAuto,
        probabilidade: probAuto,
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        valor: z.string().optional(),
        stage_id: z.number().optional(),
        probabilidade: z.number().optional(),
        probabilidadeManual: z.number().nullable().optional(),
        status: z.enum(["aberta", "ganha", "perdida", "cancelada"]).optional(),
        motivo_ganho: z.string().optional(),
        motivo_perda: z.string().optional(),
        data_fechamento_prevista: z.string().optional(),
        // SPIN fields
        spinSituacao: z.string().nullable().optional(),
        spinProblema: z.string().nullable().optional(),
        spinImplicacao: z.string().nullable().optional(),
        spinNecessidade: z.string().nullable().optional(),
        // Qualification checkboxes
        qualTemBudget: z.boolean().optional(),
        qualTemAutoridade: z.boolean().optional(),
        qualTemNecessidade: z.boolean().optional(),
        qualTemTiming: z.boolean().optional(),
        qualTemConcorrente: z.boolean().optional(),
        qualTemProximoPasso: z.boolean().optional(),
        qualTemCriterioDecisao: z.boolean().optional(),
      })
      .refine(
        (data) => data.status !== "ganha" || (!!data.motivo_ganho && data.motivo_ganho.trim().length > 0),
        { message: "Motivo de ganho é obrigatório ao fechar como Ganho", path: ["motivo_ganho"] }
      )
      .refine(
        (data) => data.status !== "perdida" || (!!data.motivo_perda && data.motivo_perda.trim().length > 0),
        { message: "Motivo de perda é obrigatório ao fechar como Perdido", path: ["motivo_perda"] }
      )
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, data_fechamento_prevista, ...rest } = input;
      const updateData: any = { ...rest };
      if (data_fechamento_prevista !== undefined) {
        updateData.data_fechamento_prevista = data_fechamento_prevista ? new Date(data_fechamento_prevista) : null;
      }

      // If stage changed, recalculate auto probability
      if (updateData.stage_id) {
        const stage = await db.select().from(pipelineStages).where(
          and(eq(pipelineStages.id, updateData.stage_id), eq(pipelineStages.organizationId, orgId(ctx)))
        ).limit(1);
        if (stage[0]) {
          updateData.probabilidadeAuto = stage[0].probabilidade_fechamento ?? 0;
          // If no manual override, update the main probability too
          if (updateData.probabilidadeManual === undefined || updateData.probabilidadeManual === null) {
            // Check if there's already a manual override
            const current = await db.select().from(opportunities).where(
              and(eq(opportunities.id, id), eq(opportunities.organizationId, orgId(ctx)))
            ).limit(1);
            if (current[0] && current[0].probabilidadeManual === null) {
              updateData.probabilidade = updateData.probabilidadeAuto;
            }
          }
        }
      }

      // If manual probability is explicitly set, use it as the main probability
      if (updateData.probabilidadeManual !== undefined && updateData.probabilidadeManual !== null) {
        updateData.probabilidade = updateData.probabilidadeManual;
      }

      await db.update(opportunities).set(updateData).where(
        and(eq(opportunities.id, id), eq(opportunities.organizationId, orgId(ctx)))
      );
      return { success: true };
    }),

  updateStage: protectedProcedure
    .input(z.object({ id: z.number(), stage_id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // REGRA DE FERRO 2: Avanço condicionado
      // 1. Deal deve ter ao menos uma atividade registrada
      const dealActivities = await db
        .select({ id: activities.id })
        .from(activities)
        .where(
          and(
            eq(activities.organizationId, orgId(ctx)),
            eq(activities.opportunity_id as any, input.id)
          )
        )
        .limit(1);

      if (dealActivities.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Não é possível avançar: registre pelo menos uma atividade antes de mudar de etapa.",
        });
      }

      // 2. Deal deve ter ao menos um próximo passo agendado (atividade pendente)
      const nextStep = await db
        .select({ id: activities.id })
        .from(activities)
        .where(
          and(
            eq(activities.organizationId, orgId(ctx)),
            eq(activities.opportunity_id as any, input.id),
            eq(activities.status as any, "pendente")
          )
        )
        .limit(1);

      if (nextStep.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Não é possível avançar: agende o próximo passo antes de mudar de etapa.",
        });
      }

      // Get stage probability for auto-update
      const stage = await db.select().from(pipelineStages).where(
        and(eq(pipelineStages.id, input.stage_id), eq(pipelineStages.organizationId, orgId(ctx)))
      ).limit(1);
      const probAuto = stage[0]?.probabilidade_fechamento ?? 0;

      // Check if there's a manual override
      const current = await db.select().from(opportunities).where(
        and(eq(opportunities.id, input.id), eq(opportunities.organizationId, orgId(ctx)))
      ).limit(1);

      const updateFields: any = {
        stage_id: input.stage_id,
        probabilidadeAuto: probAuto,
      };

      // Only update main probability if no manual override
      if (current[0] && current[0].probabilidadeManual === null) {
        updateFields.probabilidade = probAuto;
      }

      await db.update(opportunities).set(updateFields).where(
        and(eq(opportunities.id, input.id), eq(opportunities.organizationId, orgId(ctx)))
      );
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(opportunities).where(
        and(eq(opportunities.id, input.id), eq(opportunities.organizationId, orgId(ctx)))
      );
      return { success: true };
    }),
});

// ============================================================================
// TASKS
// ============================================================================

export const tasksRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        responsavel_id: z.number().optional(),
        prioridade: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions: any[] = [eq(tasks.organizationId, orgId(ctx))];
      if (input?.status) conditions.push(eq(tasks.status, input.status as any));

      return db.select().from(tasks).where(and(...conditions)).orderBy(asc(tasks.data_vencimento));
    }),

  create: protectedProcedure
    .input(
      z.object({
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        opportunity_id: z.number().optional(),
        contact_id: z.number().optional(),
        company_id: z.number().optional(),
        data_vencimento: z.string(),
        prioridade: z.enum(["baixa", "media", "alta", "critica"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(tasks).values({
        ...input,
        organizationId: orgId(ctx),
        data_vencimento: new Date(input.data_vencimento),
        responsavel_id: ctx.user.id,
        status: "pendente",
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        status: z.enum(["pendente", "em_progresso", "concluida", "cancelada"]).optional(),
        prioridade: z.enum(["baixa", "media", "alta", "critica"]).optional(),
        data_vencimento: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updateData } = input;
      const data: any = { ...updateData };
      if (data.data_vencimento) data.data_vencimento = new Date(data.data_vencimento);
      await db.update(tasks).set(data).where(and(eq(tasks.id, id), eq(tasks.organizationId, orgId(ctx))));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(tasks).where(and(eq(tasks.id, input.id), eq(tasks.organizationId, orgId(ctx))));
      return { success: true };
    }),
});

// ============================================================================
// USERS ROUTER (Org-scoped)
// ============================================================================

const usersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return db.select().from(users).where(eq(users.organizationId, orgId(ctx))).orderBy(users.name);
  }),

  updateRole: protectedProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["admin", "gerente", "vendedor"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Only org admins can change roles
      if (!ctx.user.isOrgAdmin && ctx.user.role !== "admin" && ctx.user.role !== "superadmin") {
        throw new Error("Apenas administradores podem alterar papéis");
      }
      await db.update(users).set({ role: input.role }).where(
        and(eq(users.id, input.userId), eq(users.organizationId, orgId(ctx)))
      );
      return { success: true };
    }),

  toggleActive: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (!ctx.user.isOrgAdmin && ctx.user.role !== "admin" && ctx.user.role !== "superadmin") {
        throw new Error("Apenas administradores podem ativar/desativar usuários");
      }
      const [user] = await db.select().from(users).where(
        and(eq(users.id, input.userId), eq(users.organizationId, orgId(ctx)))
      );
      if (!user) throw new Error("Usuário não encontrado");
      await db.update(users).set({ ativo: !user.ativo }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  invite: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      role: z.enum(["admin", "gerente", "vendedor"]).default("vendedor"),
      tempPassword: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isOrgAdmin && ctx.user.role !== "admin" && ctx.user.role !== "superadmin") {
        throw new Error("Apenas administradores podem convidar usuários");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check user limit
      const { getOrgUserCount, getOrganizationById, createUser } = await import("../db");
      const org = await getOrganizationById(orgId(ctx));
      if (!org) throw new Error("Organização não encontrada");

      const currentCount = await getOrgUserCount(orgId(ctx));
      if (currentCount >= org.maxUsuarios) {
        throw new Error(`Limite de ${org.maxUsuarios} usuários atingido para o plano ${org.plano}`);
      }

      // Check if email already exists
      const { getUserByEmail } = await import("../db");
      const existing = await getUserByEmail(input.email);
      if (existing) throw new Error("Email já cadastrado no sistema");

      // Hash password
      const bcrypt = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(input.tempPassword, 10);

      const newUser = await createUser({
        organizationId: orgId(ctx),
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
        isOrgAdmin: false,
      });

      return { success: true, userId: newUser?.id };
    }),
});

// ============================================================================
// MAIN CRM ROUTER
// ============================================================================

export const crmRouter = router({
  companies: companiesRouter,
  contacts: contactsRouter,
  leads: leadsRouter,
  activities: activitiesRouter,
  opportunities: opportunitiesRouter,
  pipelineStages: pipelineStagesRouter,
  tasks: tasksRouter,
  users: usersRouter,
  icps: icpsRouter,
  cadences: leadCadencesRouter,
  disqualifyReasons: disqualifyReasonsRouter,
  accountContacts: accountContactsRouter,
});
