/**
 * PRD Base44 - Complete CRM Schema
 * Implements all entities and relationships from the PRD
 */

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
  json,
  date,
  time,
  index,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================================================
// CORE ENTITIES
// ============================================================================

/**
 * 👤 Contact (Lead/Prospect)
 * Representa uma pessoa física antes da conversão para cliente
 */
export const contacts = mysqlTable(
  "contacts",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(), // DDI+DDD+número
    email: varchar("email", { length: 320 }).notNull(),
    company: varchar("company", { length: 255 }).notNull(),
    title: varchar("title", { length: 100 }).notNull(),
    lead_source: mysqlEnum("lead_source", [
      "instagram",
      "whatsapp",
      "indicacao",
      "site",
      "linkedin",
      "outros",
    ]).notNull(),
    visible_to: json("visible_to").$type<string[]>().notNull().default(["todos"]), // ['todos'] or array of emails
    status: mysqlEnum("status", [
      "prospeccao",
      "ativo",
      "convertido",
      "desqualificado",
      "aposentado",
    ])
      .default("prospeccao")
      .notNull(),
    temperature: mysqlEnum("temperature", ["frio", "morno", "quente"]),
    document: varchar("document", { length: 20 }), // CPF or CNPJ
    sector: varchar("sector", { length: 100 }),
    company_size: mysqlEnum("company_size", ["mei", "micro", "pequena", "media", "grande"]),
    region: varchar("region", { length: 100 }), // Estado/Região
    notes: longtext("notes"),
    linkedin: varchar("linkedin", { length: 255 }),
    site: varchar("site", { length: 255 }),
    icp_id: int("icp_id"),
    account_id: int("account_id"), // FK → Account (após conversão)
    cadence_id: int("cadence_id"), // FK → LeadCadence
    cadence_stage_id: int("cadence_stage_id"),
    cadence_stage_entered_at: timestamp("cadence_stage_entered_at"),
    disqualify_reason: varchar("disqualify_reason", { length: 255 }),
    created_by: int("created_by").notNull(),
    created_date: timestamp("created_date").defaultNow().notNull(),
    updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    icpIdx: index("contacts_icp_id_idx").on(table.icp_id),
    accountIdx: index("contacts_account_id_idx").on(table.account_id),
    cadenceIdx: index("contacts_cadence_id_idx").on(table.cadence_id),
    emailIdx: index("contacts_email_idx").on(table.email),
  })
);

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

/**
 * 🏢 Account (Conta/Cliente)
 * Empresa cliente, criada após conversão de um Contact
 */
export const accounts = mysqlTable(
  "accounts",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 320 }),
    site: varchar("site", { length: 255 }),
    linkedin: varchar("linkedin", { length: 255 }),
    document: varchar("document", { length: 20 }), // CNPJ
    lead_source: mysqlEnum("lead_source", [
      "instagram",
      "whatsapp",
      "indicacao",
      "site",
      "linkedin",
      "outros",
    ]),
    visible_to: json("visible_to").$type<string[]>().notNull().default(["todos"]),
    icp_id: int("icp_id"),
    temperature: mysqlEnum("temperature", ["frio", "morno", "quente"]),
    account_type: mysqlEnum("account_type", ["cliente_ativo", "cliente_inativo", "prospect"]),
    notes: longtext("notes"),
    primary_contact_id: int("primary_contact_id"), // FK → AccountContact
    primary_contact_name: varchar("primary_contact_name", { length: 255 }),
    created_by: int("created_by").notNull(),
    created_date: timestamp("created_date").defaultNow().notNull(),
    updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    icpIdx: index("accounts_icp_id_idx").on(table.icp_id),
    primaryContactIdx: index("accounts_primary_contact_id_idx").on(table.primary_contact_id),
  })
);

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

/**
 * 👥 AccountContact (Contatos da Conta)
 * Múltiplos contatos vinculados a uma conta (stakeholders)
 */
export const accountContacts = mysqlTable(
  "account_contacts",
  {
    id: int("id").autoincrement().primaryKey(),
    account_id: int("account_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    title: varchar("title", { length: 100 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 320 }),
    linkedin: varchar("linkedin", { length: 255 }),
    role: mysqlEnum("role", ["decisor", "influenciador", "comprador", "outro"]),
    is_primary: boolean("is_primary").default(false),
    created_date: timestamp("created_date").defaultNow().notNull(),
    updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    accountIdx: index("account_contacts_account_id_idx").on(table.account_id),
  })
);

export type AccountContact = typeof accountContacts.$inferSelect;
export type InsertAccountContact = typeof accountContacts.$inferInsert;

/**
 * 💼 Deal (Oportunidade)
 * Negócio em andamento, vinculado a Contact ou Account
 */
export const deals = mysqlTable(
  "deals",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    stage: mysqlEnum("stage", [
      "lead_novo",
      "tentativa_contato",
      "reuniao_call",
      "proposta_enviada",
      "negociacao",
    ]).notNull(),
    status: mysqlEnum("status", ["aberto", "ganho", "perdido"]).default("aberto").notNull(),
    value: decimal("value", { precision: 15, scale: 2 }), // Calculado via DealProduct
    deal_type: mysqlEnum("deal_type", [
      "novo_negocio",
      "renovacao",
      "recorrente",
      "upsell",
      "cross_sell",
    ]),
    contact_id: int("contact_id"),
    contact_name: varchar("contact_name", { length: 255 }),
    contact_company: varchar("contact_company", { length: 255 }),
    contact_phone: varchar("contact_phone", { length: 20 }),
    expected_close_date: date("expected_close_date"),
    close_date: date("close_date"),
    loss_reason: varchar("loss_reason", { length: 255 }),
    win_reason: varchar("win_reason", { length: 255 }),
    // SPIN Fields
    spin_situacao: longtext("spin_situacao"),
    spin_problema: longtext("spin_problema"),
    spin_implicacao: longtext("spin_implicacao"),
    spin_necessidade: longtext("spin_necessidade"),
    // Probabilidades
    probability_auto: int("probability_auto"), // 0-100 (calculado pela etapa)
    probability_manual: int("probability_manual"), // 0-100 (informado pelo vendedor)
    // Qualificação
    qual_contato_real: mysqlEnum("qual_contato_real", ["sim", "nao"]),
    qual_qualificada: mysqlEnum("qual_qualificada", ["sim", "nao"]),
    qual_apresentacao: mysqlEnum("qual_apresentacao", ["sim", "nao"]),
    qual_proposta: mysqlEnum("qual_proposta", ["sim", "nao"]),
    qual_decisor: mysqlEnum("qual_decisor", ["sim", "parcialmente", "nao"]),
    qual_objecoes: mysqlEnum("qual_objecoes", ["nenhuma", "faceis", "dificeis", "impossiveis"]),
    qual_tratativas: mysqlEnum("qual_tratativas", ["sim", "nao"]),
    // Expert Feedback
    expert_feedback: longtext("expert_feedback"),
    // Pagamento
    payment_method: mysqlEnum("payment_method", ["a_vista", "parcelado"]),
    payment_date: date("payment_date"),
    installments_count: int("installments_count"),
    first_installment_date: date("first_installment_date"),
    // Cadência
    cadence_id: int("cadence_id"),
    cadence_step: int("cadence_step"),
    // Persona
    persona_id: int("persona_id"),
    created_by: int("created_by").notNull(),
    created_date: timestamp("created_date").defaultNow().notNull(),
    updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    contactIdx: index("deals_contact_id_idx").on(table.contact_id),
    cadenceIdx: index("deals_cadence_id_idx").on(table.cadence_id),
    personaIdx: index("deals_persona_id_idx").on(table.persona_id),
    stageIdx: index("deals_stage_idx").on(table.stage),
  })
);

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;

/**
 * 📦 DealProduct (Produtos do Deal)
 * Linha de itens de um deal (composição de valor)
 */
export const dealProducts = mysqlTable(
  "deal_products",
  {
    id: int("id").autoincrement().primaryKey(),
    deal_id: int("deal_id").notNull(),
    product_id: int("product_id").notNull(),
    product_name: varchar("product_name", { length: 255 }),
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
    unit_price: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
    total: decimal("total", { precision: 15, scale: 2 }).notNull(), // quantity × unit_price
    created_date: timestamp("created_date").defaultNow().notNull(),
  },
  (table) => ({
    dealIdx: index("deal_products_deal_id_idx").on(table.deal_id),
    productIdx: index("deal_products_product_id_idx").on(table.product_id),
  })
);

export type DealProduct = typeof dealProducts.$inferSelect;
export type InsertDealProduct = typeof dealProducts.$inferInsert;

/**
 * 💳 Installment (Parcela)
 * Parcelas de pagamento geradas automaticamente ao criar um deal parcelado
 */
export const installments = mysqlTable(
  "installments",
  {
    id: int("id").autoincrement().primaryKey(),
    deal_id: int("deal_id").notNull(),
    number: int("number").notNull(),
    value: decimal("value", { precision: 15, scale: 2 }).notNull(),
    due_date: date("due_date").notNull(),
    paid_date: date("paid_date"),
    status: mysqlEnum("status", ["pendente", "paga", "vencida"]).default("pendente"),
    created_date: timestamp("created_date").defaultNow().notNull(),
  },
  (table) => ({
    dealIdx: index("installments_deal_id_idx").on(table.deal_id),
  })
);

export type Installment = typeof installments.$inferSelect;
export type InsertInstallment = typeof installments.$inferInsert;

/**
 * 📅 Activity (Atividade/Interação)
 * Registro de qualquer interação com um lead, conta ou deal
 */
export const activities = mysqlTable(
  "activities",
  {
    id: int("id").autoincrement().primaryKey(),
    type: mysqlEnum("type", [
      "whatsapp",
      "ligacao",
      "reuniao",
      "email",
      "tarefa",
      "nota",
      "visita",
      "outros",
      "conversao",
    ]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    deal_id: int("deal_id"),
    contact_id: varchar("contact_id", { length: 20 }), // int or "account_<id>"
    account_id: int("account_id"),
    parent_activity_id: int("parent_activity_id"), // Para comentários/respostas
    description: longtext("description"),
    activity_date: timestamp("activity_date").notNull(),
    completed: boolean("completed").default(false),
    deal_title: varchar("deal_title", { length: 255 }),
    is_system: boolean("is_system").default(false),
    involved_contact_ids: json("involved_contact_ids").$type<number[]>(),
    created_by: int("created_by").notNull(),
    created_date: timestamp("created_date").defaultNow().notNull(),
    updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    dealIdx: index("activities_deal_id_idx").on(table.deal_id),
    contactIdx: index("activities_contact_id_idx").on(table.contact_id),
    accountIdx: index("activities_account_id_idx").on(table.account_id),
    dateIdx: index("activities_activity_date_idx").on(table.activity_date),
  })
);

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

/**
 * 🗓️ Schedule (Agendamento)
 * Compromissos futuros com data e hora específicas
 */
export const schedules = mysqlTable(
  "schedules",
  {
    id: int("id").autoincrement().primaryKey(),
    contact_id: int("contact_id").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    scheduled_date: date("scheduled_date").notNull(),
    type: mysqlEnum("type", ["ligacao", "reuniao", "whatsapp", "visita"]).notNull(),
    deal_id: int("deal_id"),
    scheduled_time: time("scheduled_time"),
    description: longtext("description"),
    reminder: boolean("reminder").default(true),
    reminder_minutes: int("reminder_minutes").default(60),
    completed: boolean("completed").default(false),
    involved_contact_ids: json("involved_contact_ids").$type<number[]>(),
    created_by: int("created_by").notNull(),
    created_date: timestamp("created_date").defaultNow().notNull(),
    updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    contactIdx: index("schedules_contact_id_idx").on(table.contact_id),
    dealIdx: index("schedules_deal_id_idx").on(table.deal_id),
    dateIdx: index("schedules_scheduled_date_idx").on(table.scheduled_date),
  })
);

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;

/**
 * 📧 UnlinkedEmail (E-mail não vinculado)
 * E-mails capturados via CCO que não foram identificados automaticamente
 */
export const unlinkedEmails = mysqlTable(
  "unlinked_emails",
  {
    id: int("id").autoincrement().primaryKey(),
    from_email: varchar("from_email", { length: 320 }).notNull(),
    to_email: varchar("to_email", { length: 320 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    owner_email: varchar("owner_email", { length: 320 }),
    from_name: varchar("from_name", { length: 255 }),
    to_name: varchar("to_name", { length: 255 }),
    body_text: longtext("body_text"),
    body_html: longtext("body_html"),
    sent_at: timestamp("sent_at").notNull(),
    resolved: boolean("resolved").default(false),
    resolved_contact_id: int("resolved_contact_id"),
    resolved_account_id: int("resolved_account_id"),
    created_date: timestamp("created_date").defaultNow().notNull(),
  },
  (table) => ({
    fromIdx: index("unlinked_emails_from_email_idx").on(table.from_email),
    toIdx: index("unlinked_emails_to_email_idx").on(table.to_email),
    resolvedIdx: index("unlinked_emails_resolved_idx").on(table.resolved),
  })
);

export type UnlinkedEmail = typeof unlinkedEmails.$inferSelect;
export type InsertUnlinkedEmail = typeof unlinkedEmails.$inferInsert;

// ============================================================================
// CONFIGURATION & MASTER DATA
// ============================================================================

/**
 * 🛒 Product (Produto/Serviço)
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  base_price: decimal("base_price", { precision: 15, scale: 2 }).notNull(),
  unit: mysqlEnum("unit", ["unidade", "caixa", "kg", "litro", "metro", "hora"]),
  description: longtext("description"),
  created_date: timestamp("created_date").defaultNow().notNull(),
  updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * 🎯 Goal (Meta)
 */
export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  target_value: decimal("target_value", { precision: 15, scale: 2 }).notNull(),
  period_start: date("period_start").notNull(),
  period_end: date("period_end").notNull(),
  type: mysqlEnum("type", ["anual", "trimestral", "mensal"]).notNull(),
  owner: varchar("owner", { length: 320 }).notNull(), // Email or 'time'
  created_date: timestamp("created_date").defaultNow().notNull(),
  updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

/**
 * 🎯 Funnel (Funil de Vendas)
 */
export const funnels = mysqlTable("funnels", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  stages: json("stages").$type<string[]>().notNull(),
  is_default: boolean("is_default").default(false),
  created_date: timestamp("created_date").defaultNow().notNull(),
  updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
});

export type Funnel = typeof funnels.$inferSelect;
export type InsertFunnel = typeof funnels.$inferInsert;

/**
 * 🔄 LeadCadence (Cadência de Leads)
 */
export const leadCadences = mysqlTable("lead_cadences", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  stages: json("stages").$type<string[]>().notNull(),
  created_date: timestamp("created_date").defaultNow().notNull(),
  updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
});

export type LeadCadence = typeof leadCadences.$inferSelect;
export type InsertLeadCadence = typeof leadCadences.$inferInsert;

/**
 * 👤 Persona (Persona/ICP de Vendas)
 */
export const personas = mysqlTable("personas", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 100 }),
  company_size: mysqlEnum("company_size", ["mei", "micro", "pequena", "media", "grande"]),
  decision_maker_role: varchar("decision_maker_role", { length: 100 }),
  main_pains: json("main_pains").$type<string[]>(),
  created_date: timestamp("created_date").defaultNow().notNull(),
  updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
});

export type Persona = typeof personas.$inferSelect;
export type InsertPersona = typeof personas.$inferInsert;

/**
 * 🎯 ICP (Ideal Customer Profile)
 */
export const icps = mysqlTable("icps", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: longtext("description"),
  created_date: timestamp("created_date").defaultNow().notNull(),
  updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
});

export type ICP = typeof icps.$inferSelect;
export type InsertICP = typeof icps.$inferInsert;

/**
 * 📝 Template (Template de Mensagem)
 */
export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  body: longtext("body").notNull(),
  category: varchar("category", { length: 100 }),
  created_date: timestamp("created_date").defaultNow().notNull(),
  updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

/**
 * ✅ WinReason (Motivo de Ganho)
 */
export const winReasons = mysqlTable("win_reasons", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  created_date: timestamp("created_date").defaultNow().notNull(),
});

export type WinReason = typeof winReasons.$inferSelect;
export type InsertWinReason = typeof winReasons.$inferInsert;

/**
 * ❌ LossReason (Motivo de Perda)
 */
export const lossReasons = mysqlTable("loss_reasons", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  created_date: timestamp("created_date").defaultNow().notNull(),
});

export type LossReason = typeof lossReasons.$inferSelect;
export type InsertLossReason = typeof lossReasons.$inferInsert;

/**
 * 🚫 DisqualifyReason (Motivo de Desqualificação)
 */
export const disqualifyReasons = mysqlTable("disqualify_reasons", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  created_date: timestamp("created_date").defaultNow().notNull(),
});

export type DisqualifyReason = typeof disqualifyReasons.$inferSelect;
export type InsertDisqualifyReason = typeof disqualifyReasons.$inferInsert;

/**
 * ⚙️ ExpertConfig (Configuração do IA Expert)
 */
export const expertConfigs = mysqlTable("expert_configs", {
  id: int("id").autoincrement().primaryKey(),
  assistant_name: varchar("assistant_name", { length: 255 }).notNull(),
  instructions: longtext("instructions").notNull(),
  knowledge_docs: json("knowledge_docs").$type<string[]>(),
  created_date: timestamp("created_date").defaultNow().notNull(),
  updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
});

export type ExpertConfig = typeof expertConfigs.$inferSelect;
export type InsertExpertConfig = typeof expertConfigs.$inferInsert;

/**
 * 💾 SavedFilter (Filtros Salvos)
 */
export const savedFilters = mysqlTable(
  "saved_filters",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    owner_email: varchar("owner_email", { length: 320 }).notNull(),
    context: varchar("context", { length: 100 }).notNull(), // 'contacts', 'deals', etc
    filters_json: json("filters_json").$type<Record<string, any>>().notNull(),
    created_date: timestamp("created_date").defaultNow().notNull(),
    updated_date: timestamp("updated_date").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ownerIdx: index("saved_filters_owner_email_idx").on(table.owner_email),
  })
);

export type SavedFilter = typeof savedFilters.$inferSelect;
export type InsertSavedFilter = typeof savedFilters.$inferInsert;

// ============================================================================
// RELATIONS (Optional - for convenience)
// ============================================================================

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  account: one(accounts, {
    fields: [contacts.account_id],
    references: [accounts.id],
  }),
  deals: many(deals),
  activities: many(activities),
  schedules: many(schedules),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  accountContacts: many(accountContacts),
  deals: many(deals),
  activities: many(activities),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [deals.contact_id],
    references: [contacts.id],
  }),
  dealProducts: many(dealProducts),
  installments: many(installments),
  activities: many(activities),
  schedules: many(schedules),
}));

export const dealProductsRelations = relations(dealProducts, ({ one }) => ({
  deal: one(deals, {
    fields: [dealProducts.deal_id],
    references: [deals.id],
  }),
  product: one(products, {
    fields: [dealProducts.product_id],
    references: [products.id],
  }),
}));

export const installmentsRelations = relations(installments, ({ one }) => ({
  deal: one(deals, {
    fields: [installments.deal_id],
    references: [deals.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  deal: one(deals, {
    fields: [activities.deal_id],
    references: [deals.id],
  }),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
  contact: one(contacts, {
    fields: [schedules.contact_id],
    references: [contacts.id],
  }),
  deal: one(deals, {
    fields: [schedules.deal_id],
    references: [deals.id],
  }),
}));
