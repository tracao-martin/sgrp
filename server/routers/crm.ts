import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { requirePermission, requireResourceAccess, requireManagerOrAdmin } from "../authorization";
import { getDb } from "../db";
import {
  companies,
  contacts,
  leads,
  activities,
  InsertCompany,
  InsertContact,
  InsertLead,
  InsertActivity,
} from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

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
});

// ============================================================================
// CONTACTS
// ============================================================================

export const contactsRouter = router({
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
});

// ============================================================================
// MAIN CRM ROUTER
// ============================================================================

export const crmRouter = router({
  companies: companiesRouter,
  contacts: contactsRouter,
  leads: leadsRouter,
  activities: activitiesRouter,
});
