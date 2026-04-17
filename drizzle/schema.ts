import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  numeric,
  boolean,
  serial,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const orgPlanoEnum = pgEnum("org_plano", ["trial", "basico", "profissional", "enterprise"]);
export const userRoleEnum = pgEnum("user_role", ["superadmin", "admin", "gerente", "vendedor"]);
export const companyTamanhoEnum = pgEnum("company_tamanho", ["micro", "pequena", "media", "grande", "multinacional"]);
export const companyStatusEnum = pgEnum("company_status", ["ativa", "inativa", "prospect"]);
export const leadQualificacaoEnum = pgEnum("lead_qualificacao", ["frio", "morno", "quente", "qualificado"]);
export const leadStatusEnum = pgEnum("lead_status", ["novo", "contatado", "qualificado", "desqualificado", "convertido", "aposentado"]);
export const opportunityStatusEnum = pgEnum("opportunity_status", ["aberta", "ganha", "perdida", "cancelada"]);
export const activityTipoEnum = pgEnum("activity_tipo", ["email", "chamada", "reuniao", "nota", "proposta", "outro"]);
export const activityStatusEnum = pgEnum("activity_status", ["pendente", "realizada"]);
export const taskPrioridadeEnum = pgEnum("task_prioridade", ["baixa", "media", "alta", "critica"]);
export const taskStatusEnum = pgEnum("task_status", ["pendente", "em_progresso", "concluida", "cancelada"]);
export const proposalStatusEnum = pgEnum("proposal_status", ["rascunho", "enviada", "aceita", "rejeitada", "expirada"]);
export const notificationTipoEnum = pgEnum("notification_tipo", ["task_vencida", "stage_mudou", "nova_atribuicao", "proposta_aceita", "lead_qualificado"]);
export const aiInsightTipoEnum = pgEnum("ai_insight_tipo", ["resumo", "recomendacao", "risco", "oportunidade"]);
export const icpPorteEnum = pgEnum("icp_porte", ["micro", "pequena", "media", "grande", "multinacional"]);
export const cadenciaStepTipoEnum = pgEnum("cadencia_step_tipo", ["email", "ligacao", "whatsapp", "tarefa", "linkedin"]);
export const contactPapelEnum = pgEnum("contact_papel", ["decisor", "influenciador", "champion", "usuario", "tecnico", "outro"]);
export const accountTypeEnum = pgEnum("account_type", ["cliente_ativo", "cliente_inativo", "prospect"]);

// ============================================================================
// TABLES
// ============================================================================

/**
 * Organizations (Tenants) - Each client company that uses the SGRP platform
 */
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  cnpj: varchar("cnpj", { length: 20 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  plano: orgPlanoEnum("plano").default("trial").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  maxUsuarios: integer("max_usuarios").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Core user table with role-based access control and local auth
 * Roles: admin (full access), gerente (manage team), vendedor (own data)
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: text("name"),
  role: userRoleEnum("role").default("vendedor").notNull(),
  isOrgAdmin: boolean("is_org_admin").default(false).notNull(),
  departamento: varchar("departamento", { length: 255 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("users_org_idx").on(t.organizationId),
  orgActiveIdx: index("users_org_active_idx").on(t.organizationId, t.ativo),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Companies (Contas) - Main business accounts managed by the tenant
 */
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  website: varchar("website", { length: 255 }),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  pais: varchar("pais", { length: 100 }),
  segmento: varchar("segmento", { length: 100 }),
  tamanho: companyTamanhoEnum("tamanho"),
  receita_anual: numeric("receita_anual", { precision: 15, scale: 2 }),
  responsavel_id: integer("responsavel_id").references(() => users.id, {
    onDelete: "set null",
  }),
  status: companyStatusEnum("status").default("prospect").notNull(),
  icp_id: integer("icp_id"),
  lead_source: varchar("lead_source", { length: 100 }),
  site: varchar("site", { length: 500 }),
  linkedin: varchar("linkedin", { length: 500 }),
  notes: text("notes"),
  primary_contact_id: integer("primary_contact_id"),
  primary_contact_name: varchar("primary_contact_name", { length: 255 }),
  account_type: accountTypeEnum("account_type").default("prospect"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("companies_org_idx").on(t.organizationId),
  orgStatusIdx: index("companies_org_status_idx").on(t.organizationId, t.status),
  orgResponsavelIdx: index("companies_org_responsavel_idx").on(t.organizationId, t.responsavel_id),
  orgUpdatedIdx: index("companies_org_updated_idx").on(t.organizationId, t.updatedAt),
}));

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/**
 * Contacts - People within companies
 */
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  company_id: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  cargo: varchar("cargo", { length: 100 }),
  departamento: varchar("departamento", { length: 100 }),
  linkedin: varchar("linkedin", { length: 255 }),
  principal: boolean("principal").default(false),
  papel: contactPapelEnum("papel"),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("contacts_org_idx").on(t.organizationId),
  orgCompanyIdx: index("contacts_org_company_idx").on(t.organizationId, t.company_id),
}));

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

/**
 * Account Contacts (Stakeholders) - Links contacts to companies with roles
 */
export const accountContacts = pgTable("account_contacts", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  company_id: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  contact_id: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  papel: contactPapelEnum("papel"),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("account_contacts_org_idx").on(t.organizationId),
  orgCompanyIdx: index("account_contacts_org_company_idx").on(t.organizationId, t.company_id),
  uniqueLink: uniqueIndex("account_contacts_company_contact_uq").on(t.company_id, t.contact_id),
}));

export type AccountContact = typeof accountContacts.$inferSelect;
export type InsertAccountContact = typeof accountContacts.$inferInsert;

/**
 * Leads - Potential opportunities
 */
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  company_id: integer("company_id").references(() => companies.id, { onDelete: "set null" }),
  contact_id: integer("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  origem: varchar("origem", { length: 100 }),
  qualificacao: leadQualificacaoEnum("qualificacao").default("frio"),
  valor_estimado: numeric("valor_estimado", { precision: 15, scale: 2 }),
  responsavel_id: integer("responsavel_id").references(() => users.id, { onDelete: "set null" }),
  status: leadStatusEnum("status").default("novo"),
  data_conversao: timestamp("data_conversao"),
  cadencia: varchar("cadencia", { length: 100 }),
  fase_cadencia: varchar("fase_cadencia", { length: 100 }),
  telefone: varchar("telefone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  cargo: varchar("cargo", { length: 150 }),
  empresa: varchar("empresa", { length: 255 }),
  linkedin: varchar("linkedin", { length: 500 }),
  site: varchar("site", { length: 500 }),
  cpf_cnpj: varchar("cpf_cnpj", { length: 30 }),
  setor: varchar("setor", { length: 100 }),
  regiao: varchar("regiao", { length: 100 }),
  porte: varchar("porte", { length: 50 }),
  icp_id: integer("icp_id"),
  notas: text("notas"),
  motivo_desqualificacao: varchar("motivo_desqualificacao", { length: 255 }),
  cadencia_id: integer("cadencia_id"),
  cadenceStageId: varchar("cadence_stage_id", { length: 255 }),
  cadenceStageEnteredAt: timestamp("cadence_stage_entered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("leads_org_idx").on(t.organizationId),
  orgStatusIdx: index("leads_org_status_idx").on(t.organizationId, t.status),
  orgResponsavelIdx: index("leads_org_responsavel_idx").on(t.organizationId, t.responsavel_id),
  orgCompanyIdx: index("leads_org_company_idx").on(t.organizationId, t.company_id),
  orgUpdatedIdx: index("leads_org_updated_idx").on(t.organizationId, t.updatedAt),
  orgCadenciaIdx: index("leads_org_cadencia_idx").on(t.organizationId, t.cadencia_id),
}));

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Pipeline Stages - Customizable opportunity stages per organization
 */
export const pipelineStages = pgTable("pipeline_stages", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  nome: varchar("nome", { length: 100 }).notNull(),
  ordem: integer("ordem").notNull(),
  cor: varchar("cor", { length: 7 }).default("#3B82F6"),
  probabilidade_fechamento: integer("probabilidade_fechamento").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("pipeline_stages_org_idx").on(t.organizationId),
  orgOrdemIdx: index("pipeline_stages_org_ordem_idx").on(t.organizationId, t.ordem),
}));

export type PipelineStage = typeof pipelineStages.$inferSelect;
export type InsertPipelineStage = typeof pipelineStages.$inferInsert;

/**
 * Opportunities - Sales opportunities
 */
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  company_id: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "restrict" }),
  contact_id: integer("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  lead_id: integer("lead_id").references(() => leads.id, { onDelete: "set null" }),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  valor: numeric("valor", { precision: 15, scale: 2 }).notNull(),
  moeda: varchar("moeda", { length: 3 }).default("BRL"),
  stage_id: integer("stage_id")
    .notNull()
    .references(() => pipelineStages.id, { onDelete: "restrict" }),
  responsavel_id: integer("responsavel_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  data_fechamento_prevista: timestamp("data_fechamento_prevista"),
  probabilidade: integer("probabilidade").default(0),
  motivo_ganho: varchar("motivo_ganho", { length: 255 }),
  motivo_perda: varchar("motivo_perda", { length: 255 }),
  status: opportunityStatusEnum("status").default("aberta"),
  // SPIN Selling fields
  spinSituacao: text("spin_situacao"),
  spinProblema: text("spin_problema"),
  spinImplicacao: text("spin_implicacao"),
  spinNecessidade: text("spin_necessidade"),
  // Qualification checkboxes (7 criteria)
  qualTemBudget: boolean("qual_tem_budget").default(false),
  qualTemAutoridade: boolean("qual_tem_autoridade").default(false),
  qualTemNecessidade: boolean("qual_tem_necessidade").default(false),
  qualTemTiming: boolean("qual_tem_timing").default(false),
  qualTemConcorrente: boolean("qual_tem_concorrente").default(false),
  qualTemProximoPasso: boolean("qual_tem_proximo_passo").default(false),
  qualTemCriterioDecisao: boolean("qual_tem_criterio_decisao").default(false),
  // Probability: auto (from stage) vs manual override
  probabilidadeAuto: integer("probabilidade_auto").default(0),
  probabilidadeManual: integer("probabilidade_manual"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("opportunities_org_idx").on(t.organizationId),
  orgStatusIdx: index("opportunities_org_status_idx").on(t.organizationId, t.status),
  orgStageIdx: index("opportunities_org_stage_idx").on(t.organizationId, t.stage_id),
  orgResponsavelIdx: index("opportunities_org_responsavel_idx").on(t.organizationId, t.responsavel_id),
  orgCompanyIdx: index("opportunities_org_company_idx").on(t.organizationId, t.company_id),
  orgCreatedIdx: index("opportunities_org_created_idx").on(t.organizationId, t.createdAt),
}));

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

/**
 * Activities - Interactions timeline
 */
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  company_id: integer("company_id").references(() => companies.id, { onDelete: "cascade" }),
  contact_id: integer("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
  opportunity_id: integer("opportunity_id").references(() => opportunities.id, { onDelete: "cascade" }),
  lead_id: integer("lead_id").references(() => leads.id, { onDelete: "cascade" }),
  tipo: activityTipoEnum("tipo").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  usuario_id: integer("usuario_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  data_atividade: timestamp("data_atividade").notNull(),
  status: activityStatusEnum("status").default("realizada").notNull(),
  data_agendada: timestamp("data_agendada"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("activities_org_idx").on(t.organizationId),
  orgOpportunityIdx: index("activities_org_opportunity_idx").on(t.organizationId, t.opportunity_id),
  orgLeadIdx: index("activities_org_lead_idx").on(t.organizationId, t.lead_id),
  orgContactIdx: index("activities_org_contact_idx").on(t.organizationId, t.contact_id),
  orgCompanyIdx: index("activities_org_company_idx").on(t.organizationId, t.company_id),
  orgStatusIdx: index("activities_org_status_idx").on(t.organizationId, t.status),
  orgDataIdx: index("activities_org_data_idx").on(t.organizationId, t.data_atividade),
}));

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

/**
 * Tasks - Follow-ups and reminders
 */
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  opportunity_id: integer("opportunity_id").references(() => opportunities.id, { onDelete: "cascade" }),
  contact_id: integer("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
  company_id: integer("company_id").references(() => companies.id, { onDelete: "cascade" }),
  responsavel_id: integer("responsavel_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  data_vencimento: timestamp("data_vencimento").notNull(),
  prioridade: taskPrioridadeEnum("prioridade").default("media"),
  status: taskStatusEnum("status").default("pendente"),
  notificacao_enviada: boolean("notificacao_enviada").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("tasks_org_idx").on(t.organizationId),
  orgStatusIdx: index("tasks_org_status_idx").on(t.organizationId, t.status),
  orgResponsavelIdx: index("tasks_org_responsavel_idx").on(t.organizationId, t.responsavel_id),
  orgVencimentoIdx: index("tasks_org_vencimento_idx").on(t.organizationId, t.data_vencimento),
  orgOpportunityIdx: index("tasks_org_opportunity_idx").on(t.organizationId, t.opportunity_id),
}));

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Proposals - Commercial proposals
 */
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  opportunity_id: integer("opportunity_id")
    .notNull()
    .references(() => opportunities.id, { onDelete: "cascade" }),
  numero: varchar("numero", { length: 50 }).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  valor: numeric("valor", { precision: 15, scale: 2 }).notNull(),
  moeda: varchar("moeda", { length: 3 }).default("BRL"),
  condicoes_pagamento: text("condicoes_pagamento"),
  validade: timestamp("validade"),
  status: proposalStatusEnum("status").default("rascunho"),
  versao: integer("versao").default(1),
  criado_por: integer("criado_por")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("proposals_org_idx").on(t.organizationId),
  orgOpportunityIdx: index("proposals_org_opportunity_idx").on(t.organizationId, t.opportunity_id),
  orgStatusIdx: index("proposals_org_status_idx").on(t.organizationId, t.status),
}));

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

/**
 * Proposal Items - Line items in proposals
 */
export const proposalItems = pgTable("proposal_items", {
  id: serial("id").primaryKey(),
  proposal_id: integer("proposal_id")
    .notNull()
    .references(() => proposals.id, { onDelete: "cascade" }),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  quantidade: numeric("quantidade", { precision: 10, scale: 2 }).notNull(),
  valor_unitario: numeric("valor_unitario", { precision: 15, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  proposalIdx: index("proposal_items_proposal_idx").on(t.proposal_id),
}));

export type ProposalItem = typeof proposalItems.$inferSelect;
export type InsertProposalItem = typeof proposalItems.$inferInsert;

/**
 * Notifications - Internal alerts
 */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  usuario_id: integer("usuario_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tipo: notificationTipoEnum("tipo").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem"),
  link: varchar("link", { length: 255 }),
  lida: boolean("lida").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("notifications_org_idx").on(t.organizationId),
  orgUsuarioLidaIdx: index("notifications_org_usuario_lida_idx").on(t.organizationId, t.usuario_id, t.lida),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Email Logs - Track automated emails
 */
export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  usuario_id: integer("usuario_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  destinatario: varchar("destinatario", { length: 320 }).notNull(),
  assunto: varchar("assunto", { length: 255 }).notNull(),
  corpo: text("corpo"),
  relacionado_a: varchar("relacionado_a", { length: 100 }),
  relacionado_id: integer("relacionado_id"),
  enviado: boolean("enviado").default(false),
  erro: text("erro"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("email_logs_org_idx").on(t.organizationId),
  orgCreatedIdx: index("email_logs_org_created_idx").on(t.organizationId, t.createdAt),
}));

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;

/**
 * ICPs - Ideal Customer Profiles
 */
export const icps = pgTable("icps", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  segmentos: text("segmentos"), // JSON array of strings
  portes: text("portes"), // JSON array of porte enum values
  faixaReceitaMin: numeric("faixa_receita_min", { precision: 15, scale: 2 }),
  faixaReceitaMax: numeric("faixa_receita_max", { precision: 15, scale: 2 }),
  cargosDecisor: text("cargos_decisor"), // JSON array of strings
  localizacoes: text("localizacoes"), // JSON array of strings
  criteriosCustom: text("criterios_custom"), // JSON array of { label, value } objects
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("icps_org_idx").on(t.organizationId),
  orgAtivoIdx: index("icps_org_ativo_idx").on(t.organizationId, t.ativo),
}));

export type ICP = typeof icps.$inferSelect;
export type InsertICP = typeof icps.$inferInsert;

/**
 * AI Insights - Store AI-generated summaries and insights
 */
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  opportunity_id: integer("opportunity_id")
    .notNull()
    .references(() => opportunities.id, { onDelete: "cascade" }),
  tipo: aiInsightTipoEnum("tipo").notNull(),
  conteudo: text("conteudo").notNull(),
  gerado_em: timestamp("gerado_em").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  opportunityIdx: index("ai_insights_opportunity_idx").on(t.opportunity_id),
}));

export type AIInsight = typeof aiInsights.$inferSelect;
export type InsertAIInsight = typeof aiInsights.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  companies: many(companies),
  contacts: many(contacts),
  leads: many(leads),
  pipelineStages: many(pipelineStages),
  opportunities: many(opportunities),
  activities: many(activities),
  tasks: many(tasks),
  proposals: many(proposals),
  notifications: many(notifications),
  emailLogs: many(emailLogs),
  icps: many(icps),
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const companiesRelations = relations(companies, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [companies.organizationId],
    references: [organizations.id],
  }),
  contacts: many(contacts),
  accountContacts: many(accountContacts),
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
  organization: one(organizations, {
    fields: [contacts.organizationId],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [contacts.company_id],
    references: [companies.id],
  }),
  accountContacts: many(accountContacts),
  activities: many(activities),
  tasks: many(tasks),
  opportunities: many(opportunities),
}));

export const accountContactsRelations = relations(accountContacts, ({ one }) => ({
  organization: one(organizations, {
    fields: [accountContacts.organizationId],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [accountContacts.company_id],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [accountContacts.contact_id],
    references: [contacts.id],
  }),
}));

export const leadsRelations = relations(leads, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [leads.organizationId],
    references: [organizations.id],
  }),
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

export const pipelineStagesRelations = relations(pipelineStages, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [pipelineStages.organizationId],
    references: [organizations.id],
  }),
  opportunities: many(opportunities),
}));

export const opportunitiesRelations = relations(opportunities, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [opportunities.organizationId],
    references: [organizations.id],
  }),
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
  organization: one(organizations, {
    fields: [activities.organizationId],
    references: [organizations.id],
  }),
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
  organization: one(organizations, {
    fields: [tasks.organizationId],
    references: [organizations.id],
  }),
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
  organization: one(organizations, {
    fields: [proposals.organizationId],
    references: [organizations.id],
  }),
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
  organization: one(organizations, {
    fields: [notifications.organizationId],
    references: [organizations.id],
  }),
  usuario: one(users, {
    fields: [notifications.usuario_id],
    references: [users.id],
  }),
}));

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [emailLogs.organizationId],
    references: [organizations.id],
  }),
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

export const icpsRelations = relations(icps, ({ one }) => ({
  organization: one(organizations, {
    fields: [icps.organizationId],
    references: [organizations.id],
  }),
}));

// ============================================================================
// PRODUCTS - Catálogo de produtos e serviços da organização
// ============================================================================

export const productRecorrenciaEnum = pgEnum("product_recorrencia", ["mensal", "anual", "unico", "sob_demanda"]);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  categoria: varchar("categoria", { length: 100 }),
  precoBase: numeric("preco_base", { precision: 15, scale: 2 }).notNull().default("0"),
  recorrencia: productRecorrenciaEnum("recorrencia").default("mensal").notNull(),
  unidade: varchar("unidade", { length: 50 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("products_org_idx").on(t.organizationId),
  orgAtivoIdx: index("products_org_ativo_idx").on(t.organizationId, t.ativo),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const productsRelations = relations(products, ({ one }) => ({
  organization: one(organizations, {
    fields: [products.organizationId],
    references: [organizations.id],
  }),
}));

// ============================================================================
// LEAD CADENCES - Sequências de follow-up persistidas
// ============================================================================

export const leadCadences = pgTable("lead_cadences", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  ativa: boolean("ativa").default(true).notNull(),
  stages: text("stages"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("lead_cadences_org_idx").on(t.organizationId),
  orgAtivaIdx: index("lead_cadences_org_ativa_idx").on(t.organizationId, t.ativa),
}));

export type LeadCadence = typeof leadCadences.$inferSelect;
export type InsertLeadCadence = typeof leadCadences.$inferInsert;

export const leadCadencesRelations = relations(leadCadences, ({ one }) => ({
  organization: one(organizations, {
    fields: [leadCadences.organizationId],
    references: [organizations.id],
  }),
}));

// ============================================================================
// DISQUALIFY REASONS - Motivos de desqualificação persistidos
// ============================================================================

export const disqualifyReasons = pgTable("disqualify_reasons", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).default("desqualificacao").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("disqualify_reasons_org_idx").on(t.organizationId),
  orgTipoIdx: index("disqualify_reasons_org_tipo_idx").on(t.organizationId, t.tipo),
}));

export type DisqualifyReason = typeof disqualifyReasons.$inferSelect;
export type InsertDisqualifyReason = typeof disqualifyReasons.$inferInsert;

export const disqualifyReasonsRelations = relations(disqualifyReasons, ({ one }) => ({
  organization: one(organizations, {
    fields: [disqualifyReasons.organizationId],
    references: [organizations.id],
  }),
}));
