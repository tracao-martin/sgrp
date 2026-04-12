import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { requirePermission } from "../authorization";
import { getDb } from "../db";
import { accountContacts, contacts, companies } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

function orgId(ctx: { user: { organizationId: number } }) {
  return ctx.user.organizationId;
}

export const accountContactsRouter = router({
  listByCompany: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) return [];
      
      const stakeholders = await db
        .select()
        .from(accountContacts)
        .where(
          and(
            eq(accountContacts.company_id, input.companyId),
            eq(accountContacts.organizationId, orgId(ctx))
          )
        );

      // Enrich with contact details
      if (stakeholders.length === 0) return [];
      
      const contactIds = stakeholders.map(s => s.contact_id);
      const contactsList = await db
        .select()
        .from(contacts)
        .where(eq(contacts.organizationId, orgId(ctx)));
      
      const contactMap = new Map(contactsList.map(c => [c.id, c]));
      
      return stakeholders.map(s => ({
        ...s,
        contact: contactMap.get(s.contact_id) || null,
      }));
    }),

  listByContact: protectedProcedure
    .input(z.object({ contactId: z.number() }))
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) return [];
      
      const stakeholders = await db
        .select()
        .from(accountContacts)
        .where(
          and(
            eq(accountContacts.contact_id, input.contactId),
            eq(accountContacts.organizationId, orgId(ctx))
          )
        );

      if (stakeholders.length === 0) return [];
      
      const companiesList = await db
        .select()
        .from(companies)
        .where(eq(companies.organizationId, orgId(ctx)));
      
      const companyMap = new Map(companiesList.map(c => [c.id, c]));
      
      return stakeholders.map(s => ({
        ...s,
        company_name: companyMap.get(s.company_id)?.nome || null,
      }));
    }),

  create: protectedProcedure
    .input(
      z.object({
        company_id: z.number(),
        contact_id: z.number(),
        papel: z.enum(["decisor", "influenciador", "champion", "usuario", "tecnico", "outro"]).optional(),
        notas: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(accountContacts).values({
        ...input,
        organizationId: orgId(ctx),
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        papel: z.enum(["decisor", "influenciador", "champion", "usuario", "tecnico", "outro"]).nullable().optional(),
        notas: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updateData } = input;
      await db.update(accountContacts).set(updateData as any).where(
        and(eq(accountContacts.id, id), eq(accountContacts.organizationId, orgId(ctx)))
      );
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user, "manage_companies");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(accountContacts).where(
        and(eq(accountContacts.id, input.id), eq(accountContacts.organizationId, orgId(ctx)))
      );
      return { success: true };
    }),
});
