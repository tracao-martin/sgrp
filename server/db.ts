import { eq, and, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  users,
  organizations,
  companies,
  contacts,
  leads,
  opportunities,
  pipelineStages,
  tasks,
  activities,
  proposals,
  notifications,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// ORGANIZATIONS
// ============================================================================

export async function createOrganization(org: {
  nome: string;
  slug: string;
  email?: string;
  cnpj?: string;
  telefone?: string;
  plano?: "trial" | "basico" | "profissional" | "enterprise";
  maxUsuarios?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(organizations).values({
    nome: org.nome,
    slug: org.slug,
    email: org.email,
    cnpj: org.cnpj,
    telefone: org.telefone,
    plano: org.plano || "trial",
    maxUsuarios: org.maxUsuarios || 5,
  }).returning();
  return result[0];
}

export async function getOrganizationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return result[0];
}

export async function getOrganizationBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
  return result[0];
}

export async function updateOrganization(id: number, data: Partial<{
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
}>) {
  const db = await getDb();
  if (!db) return;
  await db.update(organizations).set({ ...data, updatedAt: new Date() }).where(eq(organizations.id, id));
}

/**
 * Seed default pipeline stages for a new organization
 */
export async function seedDefaultStages(orgId: number) {
  const db = await getDb();
  if (!db) return;
  const defaultStages = [
    { nome: "Prospecção", ordem: 1, cor: "#6B7280", probabilidade_fechamento: 10 },
    { nome: "Qualificação", ordem: 2, cor: "#3B82F6", probabilidade_fechamento: 25 },
    { nome: "Proposta", ordem: 3, cor: "#F59E0B", probabilidade_fechamento: 50 },
    { nome: "Negociação", ordem: 4, cor: "#8B5CF6", probabilidade_fechamento: 75 },
    { nome: "Fechamento", ordem: 5, cor: "#10B981", probabilidade_fechamento: 90 },
  ];
  await db.insert(pipelineStages).values(
    defaultStages.map((s) => ({ ...s, organizationId: orgId }))
  );
}

// ============================================================================
// USERS (Local Auth)
// ============================================================================

export async function createUser(user: {
  organizationId: number;
  email: string;
  passwordHash: string;
  name: string;
  role?: "admin" | "gerente" | "vendedor";
  isOrgAdmin?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values({
    organizationId: user.organizationId,
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    role: user.role || "vendedor",
    isOrgAdmin: user.isOrgAdmin || false,
    lastSignedIn: new Date(),
  }).returning();
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function getOrgUsers(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.organizationId, orgId));
}

export async function getOrgUserCount(orgId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(users).where(
    and(eq(users.organizationId, orgId), eq(users.ativo, true))
  );
  return result.length;
}

export async function updateUser(userId: number, orgId: number, data: Partial<{
  name: string;
  role: "admin" | "gerente" | "vendedor";
  departamento: string;
  ativo: boolean;
  isOrgAdmin: boolean;
}>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(
    and(eq(users.id, userId), eq(users.organizationId, orgId))
  );
}

// ============================================================================
// COMPANIES
// ============================================================================

export async function getCompanies(orgId: number, filters?: { responsavel_id?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(companies.organizationId, orgId)];
  if (filters?.responsavel_id) conditions.push(eq(companies.responsavel_id, filters.responsavel_id));
  if (filters?.status) conditions.push(eq(companies.status, filters.status as any));
  return db.select().from(companies).where(and(...conditions));
}

export async function getCompanyById(id: number, orgId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(
    and(eq(companies.id, id), eq(companies.organizationId, orgId))
  ).limit(1);
  return result[0];
}

// ============================================================================
// CONTACTS
// ============================================================================

export async function getContacts(orgId: number, filters?: { company_id?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(contacts.organizationId, orgId)];
  if (filters?.company_id) conditions.push(eq(contacts.company_id, filters.company_id));
  return db.select().from(contacts).where(and(...conditions));
}

export async function getContactById(id: number, orgId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contacts).where(
    and(eq(contacts.id, id), eq(contacts.organizationId, orgId))
  ).limit(1);
  return result[0];
}

// ============================================================================
// LEADS
// ============================================================================

export async function getLeads(orgId: number, filters?: { responsavel_id?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(leads.organizationId, orgId)];
  if (filters?.responsavel_id) conditions.push(eq(leads.responsavel_id, filters.responsavel_id));
  if (filters?.status) conditions.push(eq(leads.status, filters.status as any));
  return db.select().from(leads).where(and(...conditions));
}

export async function getLeadById(id: number, orgId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads).where(
    and(eq(leads.id, id), eq(leads.organizationId, orgId))
  ).limit(1);
  return result[0];
}

// ============================================================================
// OPPORTUNITIES
// ============================================================================

export async function getOpportunities(orgId: number, filters?: { responsavel_id?: number; stage_id?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(opportunities.organizationId, orgId)];
  if (filters?.responsavel_id) conditions.push(eq(opportunities.responsavel_id, filters.responsavel_id));
  if (filters?.stage_id) conditions.push(eq(opportunities.stage_id, filters.stage_id));
  if (filters?.status) conditions.push(eq(opportunities.status, filters.status as any));
  return db.select().from(opportunities).where(and(...conditions));
}

export async function getOpportunityById(id: number, orgId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(opportunities).where(
    and(eq(opportunities.id, id), eq(opportunities.organizationId, orgId))
  ).limit(1);
  return result[0];
}

// ============================================================================
// PIPELINE STAGES
// ============================================================================

export async function getPipelineStages(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pipelineStages).where(eq(pipelineStages.organizationId, orgId)).orderBy(pipelineStages.ordem);
}

// ============================================================================
// TASKS
// ============================================================================

export async function getTasks(orgId: number, filters?: { responsavel_id?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(tasks.organizationId, orgId)];
  if (filters?.responsavel_id) conditions.push(eq(tasks.responsavel_id, filters.responsavel_id));
  if (filters?.status) conditions.push(eq(tasks.status, filters.status as any));
  return db.select().from(tasks).where(and(...conditions));
}

export async function getOverdueTasks(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(
    and(
      eq(tasks.organizationId, orgId),
      eq(tasks.status, 'pendente' as any),
      lt(tasks.data_vencimento, new Date())
    )
  );
}

// ============================================================================
// ACTIVITIES
// ============================================================================

export async function getActivities(orgId: number, filters?: { opportunity_id?: number; contact_id?: number; company_id?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(activities.organizationId, orgId)];
  if (filters?.opportunity_id) conditions.push(eq(activities.opportunity_id, filters.opportunity_id));
  if (filters?.contact_id) conditions.push(eq(activities.contact_id, filters.contact_id));
  if (filters?.company_id) conditions.push(eq(activities.company_id, filters.company_id));
  return db.select().from(activities).where(and(...conditions));
}

// ============================================================================
// PROPOSALS
// ============================================================================

export async function getProposals(orgId: number, filters?: { opportunity_id?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(proposals.organizationId, orgId)];
  if (filters?.opportunity_id) conditions.push(eq(proposals.opportunity_id, filters.opportunity_id));
  return db.select().from(proposals).where(and(...conditions));
}

export async function getProposalById(id: number, orgId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(proposals).where(
    and(eq(proposals.id, id), eq(proposals.organizationId, orgId))
  ).limit(1);
  return result[0];
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function getNotificationsByUserId(userId: number, orgId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(
    and(eq(notifications.usuario_id, userId), eq(notifications.organizationId, orgId))
  );
}

export async function getUnreadNotificationsByUserId(userId: number, orgId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(
    and(
      eq(notifications.usuario_id, userId),
      eq(notifications.organizationId, orgId),
      eq(notifications.lida, false)
    )
  );
}
