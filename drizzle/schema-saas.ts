import {
  int,
  varchar,
  text,
  timestamp,
  boolean,
  decimal,
  mysqlEnum,
  mysqlTable,
  index,
  unique,
  foreignKey,
} from "drizzle-orm/mysql-core";

/**
 * SCHEMA MULTI-TENANT PARA SGRP SAAS
 * 
 * Estrutura:
 * - tenants: Cada cliente é um tenant
 * - tenant_users: Usuários dentro de um tenant
 * - tenant_subscriptions: Planos e pagamentos
 * - Todas as tabelas de negócio têm tenant_id para isolamento
 */

// ============================================
// TENANTS (Clientes SaaS)
// ============================================

export const tenants = mysqlTable(
  "tenants",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull(),
    logo: text("logo"),
    website: varchar("website", { length: 255 }),
    industry: varchar("industry", { length: 100 }),
    employees: int("employees"),
    status: mysqlEnum("status", ["active", "trial", "suspended", "cancelled"]).default("trial"),
    plan: mysqlEnum("plan", ["free", "starter", "professional", "enterprise"]).default("free"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    slugIdx: index("slug_idx").on(table.slug),
    emailIdx: index("email_idx").on(table.email),
  })
);

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// ============================================
// TENANT USERS (Usuários dentro de um Tenant)
// ============================================

export const tenantUsers = mysqlTable(
  "tenant_users",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: int("tenantId").notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    name: varchar("name", { length: 255 }),
    role: mysqlEnum("role", ["admin", "manager", "seller"]).default("seller"),
    status: mysqlEnum("status", ["active", "inactive", "invited"]).default("active"),
    lastLoginAt: timestamp("lastLoginAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("tenant_id_idx").on(table.tenantId),
    emailIdx: index("email_idx").on(table.email),
    uniqueEmail: unique("unique_tenant_email").on(table.tenantId, table.email),
    fk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete("cascade"),
  })
);

export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = typeof tenantUsers.$inferInsert;

// ============================================
// SUBSCRIPTIONS & BILLING
// ============================================

export const tenantSubscriptions = mysqlTable(
  "tenant_subscriptions",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: int("tenantId").notNull().unique(),
    plan: mysqlEnum("plan", ["free", "starter", "professional", "enterprise"]).notNull(),
    status: mysqlEnum("status", ["active", "past_due", "cancelled", "expired"]).default("active"),
    stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
    stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
    currentPeriodStart: timestamp("currentPeriodStart"),
    currentPeriodEnd: timestamp("currentPeriodEnd"),
    cancelledAt: timestamp("cancelledAt"),
    trialEndsAt: timestamp("trialEndsAt"),
    maxUsers: int("maxUsers").default(1),
    maxLeads: int("maxLeads").default(100),
    maxCompanies: int("maxCompanies").default(50),
    features: text("features"), // JSON array de features ativas
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("tenant_id_idx").on(table.tenantId),
    fk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete("cascade"),
  })
);

export type TenantSubscription = typeof tenantSubscriptions.$inferSelect;
export type InsertTenantSubscription = typeof tenantSubscriptions.$inferInsert;

// ============================================
// BILLING HISTORY
// ============================================

export const billingHistory = mysqlTable(
  "billing_history",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: int("tenantId").notNull(),
    type: mysqlEnum("type", ["charge", "refund", "adjustment"]).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("BRL"),
    status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending"),
    stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("tenant_id_idx").on(table.tenantId),
    fk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete("cascade"),
  })
);

export type BillingHistory = typeof billingHistory.$inferSelect;
export type InsertBillingHistory = typeof billingHistory.$inferInsert;

// ============================================
// COMPANIES (Contas/Empresas - POR TENANT)
// ============================================

export const companies = mysqlTable(
  "companies",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: int("tenantId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 20 }),
    website: varchar("website", { length: 255 }),
    industry: varchar("industry", { length: 100 }),
    employees: int("employees"),
    revenue: decimal("revenue", { precision: 15, scale: 2 }),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    country: varchar("country", { length: 100 }),
    status: mysqlEnum("status", ["prospect", "customer", "inactive"]).default("prospect"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("tenant_id_idx").on(table.tenantId),
    fk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete("cascade"),
  })
);

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ============================================
// CONTACTS (Contatos - POR TENANT)
// ============================================

export const contacts = mysqlTable(
  "contacts",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: int("tenantId").notNull(),
    companyId: int("companyId"),
    firstName: varchar("firstName", { length: 100 }).notNull(),
    lastName: varchar("lastName", { length: 100 }),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    title: varchar("title", { length: 100 }),
    department: varchar("department", { length: 100 }),
    status: mysqlEnum("status", ["active", "inactive", "do_not_contact"]).default("active"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("tenant_id_idx").on(table.tenantId),
    companyIdIdx: index("company_id_idx").on(table.companyId),
    fk1: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete("cascade"),
    fk2: foreignKey({
      columns: [table.companyId],
      foreignColumns: [companies.id],
    }).onDelete("set null"),
  })
);

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

// ============================================
// LEADS (Leads - POR TENANT)
// ============================================

export const leads = mysqlTable(
  "leads",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: int("tenantId").notNull(),
    contactId: int("contactId"),
    companyId: int("companyId"),
    source: varchar("source", { length: 100 }),
    status: mysqlEnum("status", ["new", "qualified", "converted", "rejected"]).default("new"),
    qualificationScore: int("qualificationScore").default(0),
    assignedTo: int("assignedTo"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("tenant_id_idx").on(table.tenantId),
    fk1: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete("cascade"),
    fk2: foreignKey({
      columns: [table.contactId],
      foreignColumns: [contacts.id],
    }).onDelete("set null"),
    fk3: foreignKey({
      columns: [table.companyId],
      foreignColumns: [companies.id],
    }).onDelete("set null"),
    fk4: foreignKey({
      columns: [table.assignedTo],
      foreignColumns: [tenantUsers.id],
    }).onDelete("set null"),
  })
);

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ============================================
// PIPELINE STAGES (Estágios - POR TENANT)
// ============================================

export const pipelineStages = mysqlTable(
  "pipeline_stages",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: int("tenantId").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    order: int("order").notNull(),
    color: varchar("color", { length: 7 }).default("#3B82F6"),
    probability: int("probability").default(0), // 0-100
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("tenant_id_idx").on(table.tenantId),
    fk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete("cascade"),
  })
);

export type PipelineStage = typeof pipelineStages.$inferSelect;
export type InsertPipelineStage = typeof pipelineStages.$inferInsert;

// ============================================
// OPPORTUNITIES (Oportunidades - POR TENANT)
// ============================================

export const opportunities = mysqlTable(
  "opportunities",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: int("tenantId").notNull(),
    companyId: int("companyId").notNull(),
    contactId: int("contactId"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    value: decimal("value", { precision: 15, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("BRL"),
    stageId: int("stageId").notNull(),
    probability: int("probability").default(0),
    assignedTo: int("assignedTo"),
    expectedCloseDate: timestamp("expectedCloseDate"),
    closedDate: timestamp("closedDate"),
    closedWon: boolean("closedWon").default(false),
    lossReason: varchar("lossReason", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("tenant_id_idx").on(table.tenantId),
    companyIdIdx: index("company_id_idx").on(table.companyId),
    fk1: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete("cascade"),
    fk2: foreignKey({
      columns: [table.companyId],
      foreignColumns: [companies.id],
    }).onDelete("cascade"),
    fk3: foreignKey({
      columns: [table.contactId],
      foreignColumns: [contacts.id],
    }).onDelete("set null"),
    fk4: foreignKey({
      columns: [table.stageId],
      foreignColumns: [pipelineStages.id],
    }).onDelete("restrict"),
    fk5: foreignKey({
      columns: [table.assignedTo],
      foreignColumns: [tenantUsers.id],
    }).onDelete("set null"),
  })
);

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

// ============================================
// ACTIVITIES (Atividades/Timeline - POR TENANT)
// ============================================

export const activities = mysqlTable(
  "activities",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: int("tenantId").notNull(),
    type: mysqlEnum("type", ["call", "email", "meeting", "task", "note"]).notNull(),
    entityType: mysqlEnum("entityType", ["company", "contact", "opportunity"]).notNull(),
    entityId: int("entityId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    createdBy: int("createdBy"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("tenant_id_idx").on(table.tenantId),
    fk1: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete("cascade"),
    fk2: foreignKey({
      columns: [table.createdBy],
      foreignColumns: [tenantUsers.id],
    }).onDelete("set null"),
  })
);

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

// ============================================
// TASKS (Tarefas - POR TENANT)
// ============================================

export const tasks = mysqlTable(
  "tasks",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: int("tenantId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    dueDate: timestamp("dueDate"),
    priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
    status: mysqlEnum("status", ["open", "in_progress", "completed", "cancelled"]).default("open"),
    assignedTo: int("assignedTo"),
    relatedTo: mysqlEnum("relatedTo", ["company", "contact", "opportunity"]),
    relatedId: int("relatedId"),
    createdBy: int("createdBy"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("tenant_id_idx").on(table.tenantId),
    fk1: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete("cascade"),
    fk2: foreignKey({
      columns: [table.assignedTo],
      foreignColumns: [tenantUsers.id],
    }).onDelete("set null"),
    fk3: foreignKey({
      columns: [table.createdBy],
      foreignColumns: [tenantUsers.id],
    }).onDelete("set null"),
  })
);

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ============================================
// PROPOSALS (Propostas - POR TENANT)
// ============================================

export const proposals = mysqlTable(
  "proposals",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: int("tenantId").notNull(),
    opportunityId: int("opportunityId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    value: decimal("value", { precision: 15, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("BRL"),
    status: mysqlEnum("status", ["draft", "sent", "viewed", "accepted", "rejected"]).default("draft"),
    validUntil: timestamp("validUntil"),
    createdBy: int("createdBy"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("tenant_id_idx").on(table.tenantId),
    opportunityIdIdx: index("opportunity_id_idx").on(table.opportunityId),
    fk1: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete("cascade"),
    fk2: foreignKey({
      columns: [table.opportunityId],
      foreignColumns: [opportunities.id],
    }).onDelete("cascade"),
    fk3: foreignKey({
      columns: [table.createdBy],
      foreignColumns: [tenantUsers.id],
    }).onDelete("set null"),
  })
);

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

// ============================================
// NOTIFICATIONS (Notificações - POR TENANT)
// ============================================

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: int("tenantId").notNull(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", ["task_due", "stage_changed", "assigned", "mention", "system"]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message"),
    read: boolean("read").default(false),
    actionUrl: varchar("actionUrl", { length: 500 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("tenant_id_idx").on(table.tenantId),
    userIdIdx: index("user_id_idx").on(table.userId),
    fk1: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete("cascade"),
    fk2: foreignKey({
      columns: [table.userId],
      foreignColumns: [tenantUsers.id],
    }).onDelete("cascade"),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================
// USAGE TRACKING (Rastreamento de Uso - POR TENANT)
// ============================================

export const usageTracking = mysqlTable(
  "usage_tracking",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: int("tenantId").notNull(),
    metric: varchar("metric", { length: 100 }).notNull(),
    value: int("value").notNull(),
    date: timestamp("date").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("tenant_id_idx").on(table.tenantId),
    dateIdx: index("date_idx").on(table.date),
    fk: foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete("cascade"),
  })
);

export type UsageTracking = typeof usageTracking.$inferSelect;
export type InsertUsageTracking = typeof usageTracking.$inferInsert;
