-- SGRP PostgreSQL Migration (Multi-Tenant)
-- Run this on a fresh database to create all tables
-- Last updated: mirrors drizzle/schema.ts (migrations 0000–0004)

-- ============================================================================
-- ENUMS
-- ============================================================================
DO $$ BEGIN CREATE TYPE org_plano AS ENUM ('trial', 'basico', 'profissional', 'enterprise'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'gerente', 'vendedor'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE company_tamanho AS ENUM ('micro', 'pequena', 'media', 'grande', 'multinacional'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE company_status AS ENUM ('ativa', 'inativa', 'prospect'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE lead_qualificacao AS ENUM ('frio', 'morno', 'quente', 'qualificado'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE lead_status AS ENUM ('novo', 'contatado', 'qualificado', 'desqualificado', 'convertido', 'aposentado'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE opportunity_status AS ENUM ('aberta', 'ganha', 'perdida', 'cancelada'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE activity_tipo AS ENUM ('email', 'chamada', 'reuniao', 'nota', 'proposta', 'outro'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE activity_status AS ENUM ('pendente', 'realizada'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE task_prioridade AS ENUM ('baixa', 'media', 'alta', 'critica'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE task_status AS ENUM ('pendente', 'em_progresso', 'concluida', 'cancelada'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE proposal_status AS ENUM ('rascunho', 'enviada', 'aceita', 'rejeitada', 'expirada'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE notification_tipo AS ENUM ('task_vencida', 'stage_mudou', 'nova_atribuicao', 'proposta_aceita', 'lead_qualificado'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE ai_insight_tipo AS ENUM ('resumo', 'recomendacao', 'risco', 'oportunidade'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE icp_porte AS ENUM ('micro', 'pequena', 'media', 'grande', 'multinacional'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE cadencia_step_tipo AS ENUM ('email', 'ligacao', 'whatsapp', 'tarefa', 'linkedin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE contact_papel AS ENUM ('decisor', 'influenciador', 'champion', 'usuario', 'tecnico', 'outro'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE account_type AS ENUM ('cliente_ativo', 'cliente_inativo', 'prospect'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  cnpj VARCHAR(20),
  email VARCHAR(320),
  telefone VARCHAR(20),
  plano org_plano NOT NULL DEFAULT 'trial',
  ativo BOOLEAN NOT NULL DEFAULT true,
  max_usuarios INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name TEXT,
  role user_role NOT NULL DEFAULT 'vendedor',
  is_org_admin BOOLEAN NOT NULL DEFAULT false,
  departamento VARCHAR(255),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_signed_in TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  email VARCHAR(320),
  telefone VARCHAR(20),
  website VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  pais VARCHAR(100),
  segmento VARCHAR(100),
  tamanho company_tamanho,
  receita_anual NUMERIC(15,2),
  responsavel_id INTEGER REFERENCES users(id),
  status company_status NOT NULL DEFAULT 'prospect',
  icp_id INTEGER,
  lead_source VARCHAR(100),
  site VARCHAR(500),
  linkedin VARCHAR(500),
  notes TEXT,
  primary_contact_id INTEGER,
  primary_contact_name VARCHAR(255),
  account_type account_type DEFAULT 'prospect',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  company_id INTEGER NOT NULL REFERENCES companies(id),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(320),
  telefone VARCHAR(20),
  cargo VARCHAR(100),
  departamento VARCHAR(100),
  linkedin VARCHAR(255),
  principal BOOLEAN DEFAULT false,
  papel contact_papel,
  notas TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Account Contacts (Stakeholders)
CREATE TABLE IF NOT EXISTS account_contacts (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  company_id INTEGER NOT NULL REFERENCES companies(id),
  contact_id INTEGER NOT NULL REFERENCES contacts(id),
  papel contact_papel,
  notas TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  company_id INTEGER REFERENCES companies(id),
  contact_id INTEGER REFERENCES contacts(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  origem VARCHAR(100),
  qualificacao lead_qualificacao DEFAULT 'frio',
  valor_estimado NUMERIC(15,2),
  responsavel_id INTEGER REFERENCES users(id),
  status lead_status DEFAULT 'novo',
  data_conversao TIMESTAMP,
  cadencia VARCHAR(100),
  fase_cadencia VARCHAR(100),
  telefone VARCHAR(30),
  email VARCHAR(320),
  cargo VARCHAR(150),
  empresa VARCHAR(255),
  linkedin VARCHAR(500),
  site VARCHAR(500),
  cpf_cnpj VARCHAR(30),
  setor VARCHAR(100),
  regiao VARCHAR(100),
  porte VARCHAR(50),
  icp_id INTEGER,
  notas TEXT,
  motivo_desqualificacao VARCHAR(255),
  cadencia_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Pipeline Stages
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  nome VARCHAR(100) NOT NULL,
  ordem INTEGER NOT NULL,
  cor VARCHAR(7) DEFAULT '#3B82F6',
  probabilidade_fechamento INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  company_id INTEGER NOT NULL REFERENCES companies(id),
  contact_id INTEGER REFERENCES contacts(id),
  lead_id INTEGER REFERENCES leads(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  valor NUMERIC(15,2) NOT NULL,
  moeda VARCHAR(3) DEFAULT 'BRL',
  stage_id INTEGER NOT NULL REFERENCES pipeline_stages(id),
  responsavel_id INTEGER NOT NULL REFERENCES users(id),
  data_fechamento_prevista TIMESTAMP,
  probabilidade INTEGER DEFAULT 0,
  motivo_ganho VARCHAR(255),
  motivo_perda VARCHAR(255),
  status opportunity_status DEFAULT 'aberta',
  -- SPIN Selling
  spin_situacao TEXT,
  spin_problema TEXT,
  spin_implicacao TEXT,
  spin_necessidade TEXT,
  -- Qualification (7 criteria)
  qual_tem_budget BOOLEAN DEFAULT false,
  qual_tem_autoridade BOOLEAN DEFAULT false,
  qual_tem_necessidade BOOLEAN DEFAULT false,
  qual_tem_timing BOOLEAN DEFAULT false,
  qual_tem_concorrente BOOLEAN DEFAULT false,
  qual_tem_proximo_passo BOOLEAN DEFAULT false,
  qual_tem_criterio_decisao BOOLEAN DEFAULT false,
  -- Probability
  probabilidade_auto INTEGER DEFAULT 0,
  probabilidade_manual INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  company_id INTEGER REFERENCES companies(id),
  contact_id INTEGER REFERENCES contacts(id),
  opportunity_id INTEGER REFERENCES opportunities(id),
  lead_id INTEGER REFERENCES leads(id),
  tipo activity_tipo NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  usuario_id INTEGER NOT NULL REFERENCES users(id),
  data_atividade TIMESTAMP NOT NULL,
  status activity_status NOT NULL DEFAULT 'realizada',
  data_agendada TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  opportunity_id INTEGER REFERENCES opportunities(id),
  contact_id INTEGER REFERENCES contacts(id),
  company_id INTEGER REFERENCES companies(id),
  responsavel_id INTEGER NOT NULL REFERENCES users(id),
  data_vencimento TIMESTAMP NOT NULL,
  prioridade task_prioridade DEFAULT 'media',
  status task_status DEFAULT 'pendente',
  notificacao_enviada BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  opportunity_id INTEGER NOT NULL REFERENCES opportunities(id),
  numero VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  valor NUMERIC(15,2) NOT NULL,
  moeda VARCHAR(3) DEFAULT 'BRL',
  condicoes_pagamento TEXT,
  validade TIMESTAMP,
  status proposal_status DEFAULT 'rascunho',
  versao INTEGER DEFAULT 1,
  criado_por INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Proposal Items
CREATE TABLE IF NOT EXISTS proposal_items (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL,
  valor_unitario NUMERIC(15,2) NOT NULL,
  subtotal NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  usuario_id INTEGER NOT NULL REFERENCES users(id),
  tipo notification_tipo NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT,
  link VARCHAR(255),
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  usuario_id INTEGER NOT NULL REFERENCES users(id),
  tipo VARCHAR(100) NOT NULL,
  destinatario VARCHAR(320) NOT NULL,
  assunto VARCHAR(255) NOT NULL,
  corpo TEXT,
  relacionado_a VARCHAR(100),
  relacionado_id INTEGER,
  enviado BOOLEAN DEFAULT false,
  erro TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ICPs (Ideal Customer Profiles)
CREATE TABLE IF NOT EXISTS icps (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  segmentos TEXT,
  portes TEXT,
  faixa_receita_min NUMERIC(15,2),
  faixa_receita_max NUMERIC(15,2),
  cargos_decisor TEXT,
  localizacoes TEXT,
  criterios_custom TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AI Insights
CREATE TABLE IF NOT EXISTS ai_insights (
  id SERIAL PRIMARY KEY,
  opportunity_id INTEGER NOT NULL REFERENCES opportunities(id),
  tipo ai_insight_tipo NOT NULL,
  conteudo TEXT NOT NULL,
  gerado_em TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Lead Cadences (Sequências de follow-up)
CREATE TABLE IF NOT EXISTS lead_cadences (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  gatilho VARCHAR(255),
  ativa BOOLEAN NOT NULL DEFAULT true,
  steps TEXT,
  total_contatos INTEGER DEFAULT 0,
  taxa_resposta INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Disqualify Reasons (Motivos de desqualificação/aposentamento)
CREATE TABLE IF NOT EXISTS disqualify_reasons (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'desqualificacao',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_companies_org ON companies(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_account_contacts_org ON account_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_account_contacts_company ON account_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_org ON pipeline_stages(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_org ON opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(organization_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_activities_org ON activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity ON activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_responsavel ON tasks(organization_id, responsavel_id);
CREATE INDEX IF NOT EXISTS idx_proposals_org ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_opportunity ON proposals(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(usuario_id, lida);
CREATE INDEX IF NOT EXISTS idx_email_logs_org ON email_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_opportunity ON ai_insights(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_icps_org ON icps(organization_id);
CREATE INDEX IF NOT EXISTS idx_lead_cadences_org ON lead_cadences(organization_id);
CREATE INDEX IF NOT EXISTS idx_disqualify_reasons_org ON disqualify_reasons(organization_id);
