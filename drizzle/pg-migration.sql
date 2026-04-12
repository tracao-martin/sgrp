-- SGRP PostgreSQL Migration (Multi-Tenant)
-- Run this on a fresh database to create all tables

-- Enums
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'gerente', 'vendedor'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE company_status AS ENUM ('ativa', 'inativa', 'prospect'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE lead_status AS ENUM ('novo', 'contatado', 'qualificado', 'desqualificado', 'convertido'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE opportunity_status AS ENUM ('aberta', 'ganha', 'perdida', 'suspensa'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE task_status AS ENUM ('pendente', 'em_andamento', 'concluida', 'cancelada'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE task_priority AS ENUM ('baixa', 'media', 'alta', 'urgente'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE activity_type AS ENUM ('ligacao', 'email', 'reuniao', 'nota', 'tarefa', 'whatsapp'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE proposal_status AS ENUM ('rascunho', 'enviada', 'aceita', 'recusada', 'expirada'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE org_plan AS ENUM ('trial', 'basico', 'profissional', 'enterprise'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  cnpj VARCHAR(20),
  email VARCHAR(255),
  telefone VARCHAR(20),
  plano org_plan NOT NULL DEFAULT 'trial',
  max_usuarios INTEGER NOT NULL DEFAULT 5,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'vendedor',
  departamento VARCHAR(100),
  is_org_admin BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  last_signed_in TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  segmento VARCHAR(100),
  porte VARCHAR(50),
  website VARCHAR(255),
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  responsavel_id INTEGER REFERENCES users(id),
  status company_status NOT NULL DEFAULT 'prospect',
  observacoes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  company_id INTEGER REFERENCES companies(id),
  nome VARCHAR(255) NOT NULL,
  cargo VARCHAR(100),
  email VARCHAR(255),
  telefone VARCHAR(20),
  celular VARCHAR(20),
  linkedin VARCHAR(255),
  decisor BOOLEAN NOT NULL DEFAULT false,
  influenciador BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  titulo VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  contato_nome VARCHAR(255),
  contato_email VARCHAR(255),
  contato_telefone VARCHAR(20),
  fonte VARCHAR(100),
  status lead_status NOT NULL DEFAULT 'novo',
  responsavel_id INTEGER REFERENCES users(id),
  valor_estimado DECIMAL(15,2),
  probabilidade INTEGER DEFAULT 0,
  qualificacao_budget BOOLEAN DEFAULT false,
  qualificacao_autoridade BOOLEAN DEFAULT false,
  qualificacao_necessidade BOOLEAN DEFAULT false,
  qualificacao_timing BOOLEAN DEFAULT false,
  qualificacao_score INTEGER DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Pipeline Stages
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  nome VARCHAR(100) NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  cor VARCHAR(7) DEFAULT '#3B82F6',
  probabilidade_fechamento INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  titulo VARCHAR(255) NOT NULL,
  company_id INTEGER REFERENCES companies(id),
  contact_id INTEGER REFERENCES contacts(id),
  stage_id INTEGER REFERENCES pipeline_stages(id),
  responsavel_id INTEGER REFERENCES users(id),
  valor DECIMAL(15,2) DEFAULT 0,
  probabilidade INTEGER DEFAULT 0,
  data_previsao_fechamento DATE,
  status opportunity_status NOT NULL DEFAULT 'aberta',
  motivo_perda TEXT,
  observacoes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  tipo activity_type NOT NULL DEFAULT 'nota',
  descricao TEXT NOT NULL,
  opportunity_id INTEGER REFERENCES opportunities(id),
  contact_id INTEGER REFERENCES contacts(id),
  company_id INTEGER REFERENCES companies(id),
  usuario_id INTEGER REFERENCES users(id),
  data_atividade TIMESTAMP NOT NULL DEFAULT NOW(),
  duracao_minutos INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  responsavel_id INTEGER REFERENCES users(id),
  opportunity_id INTEGER REFERENCES opportunities(id),
  contact_id INTEGER REFERENCES contacts(id),
  company_id INTEGER REFERENCES companies(id),
  status task_status NOT NULL DEFAULT 'pendente',
  prioridade task_priority NOT NULL DEFAULT 'media',
  data_vencimento TIMESTAMP,
  data_conclusao TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  opportunity_id INTEGER NOT NULL REFERENCES opportunities(id),
  titulo VARCHAR(255) NOT NULL,
  valor_total DECIMAL(15,2) DEFAULT 0,
  desconto_percentual DECIMAL(5,2) DEFAULT 0,
  validade DATE,
  status proposal_status NOT NULL DEFAULT 'rascunho',
  observacoes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Proposal Items
CREATE TABLE IF NOT EXISTS proposal_items (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(15,2) NOT NULL DEFAULT 0,
  desconto DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  usuario_id INTEGER NOT NULL REFERENCES users(id),
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT,
  tipo VARCHAR(50) DEFAULT 'info',
  lida BOOLEAN NOT NULL DEFAULT false,
  link VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  de VARCHAR(255) NOT NULL,
  para VARCHAR(255) NOT NULL,
  assunto VARCHAR(255) NOT NULL,
  corpo TEXT,
  status VARCHAR(50) DEFAULT 'enviado',
  opportunity_id INTEGER REFERENCES opportunities(id),
  contact_id INTEGER REFERENCES contacts(id),
  usuario_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AI Insights
CREATE TABLE IF NOT EXISTS ai_insights (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  opportunity_id INTEGER REFERENCES opportunities(id),
  tipo VARCHAR(50) NOT NULL,
  conteudo TEXT NOT NULL,
  confianca DECIMAL(3,2) DEFAULT 0,
  usuario_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_companies_org ON companies(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_opportunities_org ON opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(organization_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_org ON pipeline_stages(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_responsavel ON tasks(organization_id, responsavel_id);
CREATE INDEX IF NOT EXISTS idx_activities_org ON activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity ON activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_proposals_org ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_opportunity ON proposals(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(usuario_id, lida);
CREATE INDEX IF NOT EXISTS idx_email_logs_org ON email_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_org ON ai_insights(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- ============================================================================
-- Sprint 2: SPIN Selling + Qualification + Auto-Probability
-- ============================================================================

-- SPIN Selling fields
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS spin_situacao TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS spin_problema TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS spin_implicacao TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS spin_necessidade TEXT;

-- Qualification checkboxes (7 criteria)
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS qual_tem_budget BOOLEAN DEFAULT false;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS qual_tem_autoridade BOOLEAN DEFAULT false;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS qual_tem_necessidade BOOLEAN DEFAULT false;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS qual_tem_timing BOOLEAN DEFAULT false;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS qual_tem_concorrente BOOLEAN DEFAULT false;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS qual_tem_proximo_passo BOOLEAN DEFAULT false;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS qual_tem_criterio_decisao BOOLEAN DEFAULT false;

-- Probability: auto (from stage) vs manual override
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS probabilidade_auto INTEGER DEFAULT 0;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS probabilidade_manual INTEGER;
