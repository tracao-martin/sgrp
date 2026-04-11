import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  longtext,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table with role-based access control
 * Roles: admin (full access), gerente (manage team), vendedor (own data)
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "gerente", "vendedor"]).default("vendedor").notNull(),
  departamento: varchar("departamento", { length: 255 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Companies (Contas) - Main business accounts
 */
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }).unique(),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  website: varchar("website", { length: 255 }),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  pais: varchar("pais", { length: 100 }),
  segmento: varchar("segmento", { length: 100 }),
  tamanho: mysqlEnum("tamanho", ["micro", "pequena", "media", "grande", "multinacional"]),
  receita_anual: decimal("receita_anual", { precision: 15, scale: 2 }),
  responsavel_id: int("responsavel_id"),
  status: mysqlEnum("status", ["ativa", "inativa", "prospect"]).default("prospect").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/**
 * Contacts - People within companies
 */
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  company_id: int("company_id").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).unique(),
  telefone: varchar("telefone", { length: 20 }),
  cargo: varchar("cargo", { length: 100 }),
  departamento: varchar("departamento", { length: 100 }),
  linkedin: varchar("linkedin", { length: 255 }),
  principal: boolean("principal").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

/**
 * Leads - Potential opportunities
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  company_id: int("company_id"),
  contact_id: int("contact_id"),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: longtext("descricao"),
  origem: varchar("origem", { length: 100 }),
  qualificacao: mysqlEnum("qualificacao", ["frio", "morno", "quente", "qualificado"]).default("frio"),
  valor_estimado: decimal("valor_estimado", { precision: 15, scale: 2 }),
  responsavel_id: int("responsavel_id"),
  status: mysqlEnum("status", ["novo", "em_contato", "qualificado", "convertido", "perdido"]).default("novo"),
  data_conversao: timestamp("data_conversao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Pipeline Stages - Customizable opportunity stages
 */
export const pipelineStages = mysqlTable("pipeline_stages", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  ordem: int("ordem").notNull(),
  cor: varchar("cor", { length: 7 }).default("#3B82F6"),
  probabilidade_fechamento: int("probabilidade_fechamento").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PipelineStage = typeof pipelineStages.$inferSelect;
export type InsertPipelineStage = typeof pipelineStages.$inferInsert;

/**
 * Opportunities - Sales opportunities
 */
export const opportunities = mysqlTable("opportunities", {
  id: int("id").autoincrement().primaryKey(),
  company_id: int("company_id").notNull(),
  contact_id: int("contact_id"),
  lead_id: int("lead_id"),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: longtext("descricao"),
  valor: decimal("valor", { precision: 15, scale: 2 }).notNull(),
  moeda: varchar("moeda", { length: 3 }).default("BRL"),
  stage_id: int("stage_id").notNull(),
  responsavel_id: int("responsavel_id").notNull(),
  data_fechamento_prevista: timestamp("data_fechamento_prevista"),
  probabilidade: int("probabilidade").default(0),
  motivo_ganho: varchar("motivo_ganho", { length: 255 }),
  motivo_perda: varchar("motivo_perda", { length: 255 }),
  status: mysqlEnum("status", ["aberta", "ganha", "perdida", "cancelada"]).default("aberta"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

/**
 * Activities - Interactions timeline
 */
export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  company_id: int("company_id"),
  contact_id: int("contact_id"),
  opportunity_id: int("opportunity_id"),
  tipo: mysqlEnum("tipo", ["email", "chamada", "reuniao", "nota", "proposta", "outro"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: longtext("descricao"),
  usuario_id: int("usuario_id").notNull(),
  data_atividade: timestamp("data_atividade").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

/**
 * Tasks - Follow-ups and reminders
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: longtext("descricao"),
  opportunity_id: int("opportunity_id"),
  contact_id: int("contact_id"),
  company_id: int("company_id"),
  responsavel_id: int("responsavel_id").notNull(),
  data_vencimento: timestamp("data_vencimento").notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "critica"]).default("media"),
  status: mysqlEnum("status", ["pendente", "em_progresso", "concluida", "cancelada"]).default("pendente"),
  notificacao_enviada: boolean("notificacao_enviada").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Proposals - Commercial proposals
 */
export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  opportunity_id: int("opportunity_id").notNull(),
  numero: varchar("numero", { length: 50 }).unique().notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: longtext("descricao"),
  valor: decimal("valor", { precision: 15, scale: 2 }).notNull(),
  moeda: varchar("moeda", { length: 3 }).default("BRL"),
  condicoes_pagamento: text("condicoes_pagamento"),
  validade: timestamp("validade"),
  status: mysqlEnum("status", ["rascunho", "enviada", "aceita", "rejeitada", "expirada"]).default("rascunho"),
  versao: int("versao").default(1),
  criado_por: int("criado_por").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

/**
 * Proposal Items - Line items in proposals
 */
export const proposalItems = mysqlTable("proposal_items", {
  id: int("id").autoincrement().primaryKey(),
  proposal_id: int("proposal_id").notNull(),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  quantidade: decimal("quantidade", { precision: 10, scale: 2 }).notNull(),
  valor_unitario: decimal("valor_unitario", { precision: 15, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProposalItem = typeof proposalItems.$inferSelect;
export type InsertProposalItem = typeof proposalItems.$inferInsert;

/**
 * Notifications - Internal alerts
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  usuario_id: int("usuario_id").notNull(),
  tipo: mysqlEnum("tipo", ["task_vencida", "stage_mudou", "nova_atribuicao", "proposta_aceita", "lead_qualificado"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: longtext("mensagem"),
  link: varchar("link", { length: 255 }),
  lida: boolean("lida").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Email Logs - Track automated emails
 */
export const emailLogs = mysqlTable("email_logs", {
  id: int("id").autoincrement().primaryKey(),
  usuario_id: int("usuario_id").notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  destinatario: varchar("destinatario", { length: 320 }).notNull(),
  assunto: varchar("assunto", { length: 255 }).notNull(),
  corpo: longtext("corpo"),
  relacionado_a: varchar("relacionado_a", { length: 100 }),
  relacionado_id: int("relacionado_id"),
  enviado: boolean("enviado").default(false),
  erro: text("erro"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;

/**
 * AI Insights - Store AI-generated summaries and insights
 */
export const aiInsights = mysqlTable("ai_insights", {
  id: int("id").autoincrement().primaryKey(),
  opportunity_id: int("opportunity_id").notNull(),
  tipo: mysqlEnum("tipo", ["resumo", "proximos_passos", "probabilidade_fechamento"]).notNull(),
  conteudo: longtext("conteudo").notNull(),
  gerado_em: timestamp("gerado_em").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIInsight = typeof aiInsights.$inferSelect;
export type InsertAIInsight = typeof aiInsights.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const companiesRelations = relations(companies, ({ many, one }) => ({
  contacts: many(contacts),
  leads: many(leads),
  opportunities: many(opportunities),
  activities: many(activities),
  tasks: many(tasks),
  responsavel: one(users, {
    fields: [companies.responsavel_id],
    references: [users.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ many, one }) => ({
  company: one(companies, {
    fields: [contacts.company_id],
    references: [companies.id],
  }),
  activities: many(activities),
  tasks: many(tasks),
  opportunities: many(opportunities),
}));

export const leadsRelations = relations(leads, ({ many, one }) => ({
  company: one(companies, {
    fields: [leads.company_id],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [leads.contact_id],
    references: [contacts.id],
  }),
  responsavel: one(users, {
    fields: [leads.responsavel_id],
    references: [users.id],
  }),
  opportunities: many(opportunities),
}));

export const opportunitiesRelations = relations(opportunities, ({ many, one }) => ({
  company: one(companies, {
    fields: [opportunities.company_id],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [opportunities.contact_id],
    references: [contacts.id],
  }),
  lead: one(leads, {
    fields: [opportunities.lead_id],
    references: [leads.id],
  }),
  stage: one(pipelineStages, {
    fields: [opportunities.stage_id],
    references: [pipelineStages.id],
  }),
  responsavel: one(users, {
    fields: [opportunities.responsavel_id],
    references: [users.id],
  }),
  activities: many(activities),
  tasks: many(tasks),
  proposals: many(proposals),
  aiInsights: many(aiInsights),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  company: one(companies, {
    fields: [activities.company_id],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [activities.contact_id],
    references: [contacts.id],
  }),
  opportunity: one(opportunities, {
    fields: [activities.opportunity_id],
    references: [opportunities.id],
  }),
  usuario: one(users, {
    fields: [activities.usuario_id],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [tasks.opportunity_id],
    references: [opportunities.id],
  }),
  contact: one(contacts, {
    fields: [tasks.contact_id],
    references: [contacts.id],
  }),
  company: one(companies, {
    fields: [tasks.company_id],
    references: [companies.id],
  }),
  responsavel: one(users, {
    fields: [tasks.responsavel_id],
    references: [users.id],
  }),
}));

export const proposalsRelations = relations(proposals, ({ many, one }) => ({
  opportunity: one(opportunities, {
    fields: [proposals.opportunity_id],
    references: [opportunities.id],
  }),
  items: many(proposalItems),
  criadoPor: one(users, {
    fields: [proposals.criado_por],
    references: [users.id],
  }),
}));

export const proposalItemsRelations = relations(proposalItems, ({ one }) => ({
  proposal: one(proposals, {
    fields: [proposalItems.proposal_id],
    references: [proposals.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  usuario: one(users, {
    fields: [notifications.usuario_id],
    references: [users.id],
  }),
}));

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  usuario: one(users, {
    fields: [emailLogs.usuario_id],
    references: [users.id],
  }),
}));

export const aiInsightsRelations = relations(aiInsights, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [aiInsights.opportunity_id],
    references: [opportunities.id],
  }),
}));
