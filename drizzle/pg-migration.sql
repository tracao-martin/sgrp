-- PostgreSQL Migration for SGRP
-- This creates all tables from scratch for a fresh PostgreSQL database

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'gerente', 'vendedor');
CREATE TYPE company_tamanho AS ENUM ('micro', 'pequena', 'media', 'grande', 'multinacional');
CREATE TYPE company_status AS ENUM ('ativa', 'inativa', 'prospect');
CREATE TYPE lead_qualificacao AS ENUM ('frio', 'morno', 'quente', 'qualificado');
CREATE TYPE lead_status AS ENUM ('novo', 'em_contato', 'qualificado', 'convertido', 'perdido');
CREATE TYPE opportunity_status AS ENUM ('aberta', 'ganha', 'perdida', 'cancelada');
CREATE TYPE activity_tipo AS ENUM ('email', 'chamada', 'reuniao', 'nota', 'proposta', 'outro');
CREATE TYPE task_prioridade AS ENUM ('baixa', 'media', 'alta', 'critica');
CREATE TYPE task_status AS ENUM ('pendente', 'em_progresso', 'concluida', 'cancelada');
CREATE TYPE proposal_status AS ENUM ('rascunho', 'enviada', 'aceita', 'rejeitada', 'expirada');
CREATE TYPE notification_tipo AS ENUM ('task_vencida', 'stage_mudou', 'nova_atribuicao', 'proposta_aceita', 'lead_qualificado');
CREATE TYPE ai_insight_tipo AS ENUM ('resumo', 'recomendacao', 'risco', 'oportunidade');

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name TEXT,
  role user_role NOT NULL DEFAULT 'vendedor',
  departamento VARCHAR(255),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_signed_in TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Contacts
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(320) UNIQUE,
  telefone VARCHAR(20),
  cargo VARCHAR(100),
  departamento VARCHAR(100),
  linkedin VARCHAR(255),
  principal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Pipeline Stages
CREATE TABLE pipeline_stages (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  ordem INTEGER NOT NULL,
  cor VARCHAR(7) DEFAULT '#3B82F6',
  probabilidade_fechamento INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Opportunities
CREATE TABLE opportunities (
  id SERIAL PRIMARY KEY,
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Activities
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  contact_id INTEGER REFERENCES contacts(id),
  opportunity_id INTEGER REFERENCES opportunities(id),
  tipo activity_tipo NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  usuario_id INTEGER NOT NULL REFERENCES users(id),
  data_atividade TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  opportunity_id INTEGER REFERENCES opportunities(id),
  contact_id INTEGER REFERENCES contacts(id),
  company_id INTEGER REFERENCES companies(id),
  responsavel_id INTEGER NOT NULL REFERENCES users(id),
  data_vencimento TIMESTAMP NOT NULL,
  prioridade task_prioridade DEFAULT 'media',
  status task_status DEFAULT 'pendente',
  notificacao_enviada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Proposals
CREATE TABLE proposals (
  id SERIAL PRIMARY KEY,
  opportunity_id INTEGER NOT NULL REFERENCES opportunities(id),
  numero VARCHAR(50) UNIQUE NOT NULL,
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
CREATE TABLE proposal_items (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER NOT NULL REFERENCES proposals(id),
  descricao VARCHAR(255) NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL,
  valor_unitario NUMERIC(15,2) NOT NULL,
  subtotal NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES users(id),
  tipo notification_tipo NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT,
  link VARCHAR(255),
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Email Logs
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES users(id),
  tipo VARCHAR(100) NOT NULL,
  destinatario VARCHAR(320) NOT NULL,
  assunto VARCHAR(255) NOT NULL,
  corpo TEXT,
  relacionado_a VARCHAR(100),
  relacionado_id INTEGER,
  enviado BOOLEAN DEFAULT FALSE,
  erro TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AI Insights
CREATE TABLE ai_insights (
  id SERIAL PRIMARY KEY,
  opportunity_id INTEGER NOT NULL REFERENCES opportunities(id),
  tipo ai_insight_tipo NOT NULL,
  conteudo TEXT NOT NULL,
  gerado_em TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Default pipeline stages
INSERT INTO pipeline_stages (nome, ordem, cor, probabilidade_fechamento) VALUES
  ('Prospecção', 1, '#6366F1', 10),
  ('Qualificação', 2, '#8B5CF6', 25),
  ('Apresentação', 3, '#3B82F6', 40),
  ('Proposta', 4, '#F59E0B', 60),
  ('Negociação', 5, '#F97316', 80),
  ('Fechamento', 6, '#10B981', 95);
