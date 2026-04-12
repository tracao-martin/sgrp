import { eq, and, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
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

// Lazily create the drizzle instance so local tooling can run without a DB.
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
// USERS (Local Auth)
// ============================================================================

export async function createUser(user: { email: string; passwordHash: string; name: string; role?: "admin" | "gerente" | "vendedor" }): Promise<typeof users.$inferSelect | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values({
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    role: user.role || "vendedor",
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

// ============================================================================
// COMPANIES
// ============================================================================

export async function getCompanies(filters?: { responsavel_id?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query: any = db.select().from(companies);
  if (filters?.responsavel_id) {
    query = query.where(eq(companies.responsavel_id, filters.responsavel_id));
  }
  if (filters?.status) {
    query = query.where(eq(companies.status, filters.status as any));
  }
  return query;
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result[0];
}

// ============================================================================
// CONTACTS
// ============================================================================

export async function getContactsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contacts).where(eq(contacts.company_id, companyId));
}

export async function getContactById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  return result[0];
}

// ============================================================================
// LEADS
// ============================================================================

export async function getLeads(filters?: { responsavel_id?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query: any = db.select().from(leads);
  if (filters?.responsavel_id) {
    query = query.where(eq(leads.responsavel_id, filters.responsavel_id));
  }
  if (filters?.status) {
    query = query.where(eq(leads.status, filters.status as any));
  }
  return query;
}

export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0];
}

// ============================================================================
// OPPORTUNITIES
// ============================================================================

export async function getOpportunities(filters?: { responsavel_id?: number; stage_id?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query: any = db.select().from(opportunities);
  if (filters?.responsavel_id) {
    query = query.where(eq(opportunities.responsavel_id, filters.responsavel_id));
  }
  if (filters?.stage_id) {
    query = query.where(eq(opportunities.stage_id, filters.stage_id));
  }
  if (filters?.status) {
    query = query.where(eq(opportunities.status, filters.status as any));
  }
  return query;
}

export async function getOpportunityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
  return result[0];
}

// ============================================================================
// PIPELINE STAGES
// ============================================================================

export async function getPipelineStages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pipelineStages).orderBy(pipelineStages.ordem);
}

// ============================================================================
// TASKS
// ============================================================================

export async function getTasks(filters?: { responsavel_id?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query: any = db.select().from(tasks);
  if (filters?.responsavel_id) {
    query = query.where(eq(tasks.responsavel_id, filters.responsavel_id));
  }
  if (filters?.status) {
    query = query.where(eq(tasks.status, filters.status as any));
  }
  return query;
}

export async function getOverdueTasks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(
    and(
      eq(tasks.status, 'pendente' as any),
      lt(tasks.data_vencimento, new Date())
    )
  );
}

// ============================================================================
// ACTIVITIES
// ============================================================================

export async function getActivitiesByOpportunityId(opportunityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activities).where(eq(activities.opportunity_id, opportunityId));
}

export async function getActivitiesByContactId(contactId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activities).where(eq(activities.contact_id, contactId));
}

// ============================================================================
// PROPOSALS
// ============================================================================

export async function getProposalsByOpportunityId(opportunityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proposals).where(eq(proposals.opportunity_id, opportunityId));
}

export async function getProposalById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result[0];
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function getNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.usuario_id, userId));
}

export async function getUnreadNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(
    and(
      eq(notifications.usuario_id, userId),
      eq(notifications.lida, false)
    )
  );
}
