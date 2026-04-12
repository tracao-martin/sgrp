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
  pipelineStages,
  tasks,
  InsertCompany,
  InsertContact,
  InsertLead,
  InsertActivity,
  InsertOpportunity,
  InsertTask,
} from "../../drizzle/schema";
import { eq, desc, and, asc, lte } from "drizzle-orm";

// ============================================================================
// COMPANIES
// ============================================================================

export const companiesRouter = router({
  /**
   * List all companies (with filters for role-based access)
   */
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

      let query: any = db.select().from(companies);

      // Vendedores só veem suas próprias empresas
      if (ctx.user.role === "vendedor") {
        query = query.where(eq(companies.responsavel_id, ctx.user.id));
      }

      if (input.status) {
        query = query.where(eq(companies.status, input.status));
      }

      return query.orderBy(desc(companies.updatedAt)).limit(input.limit);
    }),

  /**
   * Get company details with related data
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) return null;

      const company = await db
        .select()
        .from(companies)
        .where(eq(companies.id, input.id))
        .limit(1);

      if (!company[0]) return null;

      // Check access
      if (ctx.user.role === "vendedor" && company[0].responsavel_id !== ctx.user.id) {
        throw new Error("Acesso negado");
      }

      return company[0];
    }),

  /**
   * Create company
   */
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const data: InsertCompany = {
        ...input,
        responsavel_id: ctx.user.id,
      } as any;

      const result = await db.insert(companies).values(data);
      return result;
    }),

  /**
   * Update company
   */
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const company = await db
        .select()
        .from(companies)
        .where(eq(companies.id, input.id))
        .limit(1);

      if (!company[0]) throw new Error("Empresa não encontrada");
      requireResourceAccess(ctx.user, company[0].responsavel_id || 0);

      const { id, ...updateData } = input;
      await db.update(companies).set(updateData as any).where(eq(companies.id, id));

      return { success: true };
    }),

  /**
   * Delete company
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(companies).where(eq(companies.id, input.id));
      return { success: true };
    }),
});

// ============================================================================
// CONTACTS
// ============================================================================

export const contactsRouter = router({
  /**
   * List all contacts
   */
  list: protectedProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ ctx }) => {
      requirePermission(ctx.user, "manage_contacts");
      const db = await getDb();
      if (!db) return [];
      return db.select().from(contacts).orderBy(desc(contacts.createdAt));
    }),

  /**
   * List contacts by company
   */
  listByCompany: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_contacts");
      const db = await getDb();
      if (!db) return [];

      return db.select().from(contacts).where(eq(contacts.company_id, input.companyId));
    }),

  /**
   * Get contact details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_contacts");
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(contacts)
        .where(eq(contacts.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  /**
   * Create contact
   */
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_contacts");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const data: InsertContact = input;
      await db.insert(contacts).values(data);

      return { success: true };
    }),

  /**
   * Update contact
   */
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_contacts");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updateData } = input;
      await db.update(contacts).set(updateData).where(eq(contacts.id, id));

      return { success: true };
    }),

  /**
   * Delete contact
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_contacts");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(contacts).where(eq(contacts.id, input.id));
      return { success: true };
    }),
});

// ============================================================================
// LEADS
// ============================================================================

export const leadsRouter = router({
  /**
   * List leads (with role-based filtering)
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        qualificacao: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) return [];

      let query: any = db.select().from(leads);

      // Vendedores só veem seus próprios leads
      if (ctx.user.role === "vendedor") {
        query = query.where(eq(leads.responsavel_id, ctx.user.id));
      }

      if (input.status) {
        query = query.where(eq(leads.status, input.status as any));
      }

      if (input.qualificacao) {
        query = query.where(eq(leads.qualificacao, input.qualificacao as any));
      }

      return query.orderBy(desc(leads.updatedAt)).limit(input.limit);
    }),

  /**
   * Get lead details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(leads)
        .where(eq(leads.id, input.id))
        .limit(1);

      if (!result[0]) return null;

      // Check access
      if (ctx.user.role === "vendedor" && result[0].responsavel_id !== ctx.user.id) {
        throw new Error("Acesso negado");
      }

      return result[0];
    }),

  /**
   * Create lead
   */
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const data: InsertLead = {
        ...input,
        responsavel_id: ctx.user.id,
      } as any;

      await db.insert(leads).values(data);
      return { success: true };
    }),

  /**
   * Update lead qualification
   */
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
        .where(eq(leads.id, input.id));

      return { success: true };
    }),

  /**
   * Convert lead to opportunity
   */
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

      // Update lead status
      await db
        .update(leads)
        .set({
          status: "convertido" as any,
          data_conversao: new Date(),
        })
        .where(eq(leads.id, input.leadId));

      return { success: true };
    }),

  /**
   * Update lead
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        origem: z.string().optional(),
        qualificacao: z.enum(["frio", "morno", "quente", "qualificado"]).optional(),
        valor_estimado: z.number().optional(),
        status: z.enum(["novo", "contatado", "qualificado", "convertido", "perdido"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updateData } = input;
      await db.update(leads).set(updateData as any).where(eq(leads.id, id));
      return { success: true };
    }),

  /**
   * Delete lead
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_leads");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(leads).where(eq(leads.id, input.id));
      return { success: true };
    }),
});

// ============================================================================
// ACTIVITIES (Timeline)
// ============================================================================

export const activitiesRouter = router({
  /**
   * Get activities for opportunity
   */
  getByOpportunity: protectedProcedure
    .input(z.object({ opportunityId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(activities)
        .where(eq(activities.opportunity_id, input.opportunityId))
        .orderBy(desc(activities.data_atividade));
    }),

  /**
   * Get activities for contact
   */
  getByContact: protectedProcedure
    .input(z.object({ contactId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(activities)
        .where(eq(activities.contact_id, input.contactId))
        .orderBy(desc(activities.data_atividade));
    }),

  /**
   * Create activity
   */
  create: protectedProcedure
    .input(
      z.object({
        tipo: z.enum(["email", "chamada", "reuniao", "nota", "proposta", "outro"]),
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        opportunity_id: z.number().optional(),
        contact_id: z.number().optional(),
        company_id: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const data: InsertActivity = {
        ...input,
        usuario_id: ctx.user.id,
        data_atividade: new Date(),
      };

      await db.insert(activities).values(data);
      return { success: true };
    }),

  /**
   * List all activities
   */
  list: protectedProcedure
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(activities).orderBy(desc(activities.data_atividade));
    }),

  /**
   * Delete activity
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(activities).where(eq(activities.id, input.id));
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
    return db.select().from(pipelineStages).orderBy(asc(pipelineStages.ordem));
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
      let query = db.select().from(opportunities).orderBy(desc(opportunities.createdAt));
      if (input?.stage_id) {
        query = query.where(eq(opportunities.stage_id, input.stage_id)) as any;
      }
      if (input?.status) {
        query = query.where(eq(opportunities.status, input.status as any)) as any;
      }
      return query;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(opportunities).where(eq(opportunities.id, input.id)).limit(1);
      return result[0] || null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        company_id: z.number(),
        contact_id: z.number().optional(),
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
      const data: InsertOpportunity = {
        ...input,
        data_fechamento_prevista: input.data_fechamento_prevista ? new Date(input.data_fechamento_prevista) : undefined,
        responsavel_id: ctx.user.id,
        status: "aberta",
      };
      await db.insert(opportunities).values(data);
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
        status: z.enum(["aberta", "ganha", "perdida", "cancelada"]).optional(),
        motivo_ganho: z.string().optional(),
        motivo_perda: z.string().optional(),
        data_fechamento_prevista: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updateData } = input;
      await db.update(opportunities).set(updateData as any).where(eq(opportunities.id, id));
      return { success: true };
    }),

  updateStage: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        stage_id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(opportunities).set({ stage_id: input.stage_id }).where(eq(opportunities.id, input.id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(opportunities).where(eq(opportunities.id, input.id));
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
      let query = db.select().from(tasks).orderBy(asc(tasks.data_vencimento));
      if (input?.status) {
        query = query.where(eq(tasks.status, input.status as any)) as any;
      }
      return query;
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
      const data: InsertTask = {
        ...input,
        data_vencimento: new Date(input.data_vencimento),
        responsavel_id: ctx.user.id,
        status: "pendente",
      };
      await db.insert(tasks).values(data);
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
      await db.update(tasks).set(data).where(eq(tasks.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true };
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
});
