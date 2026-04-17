-- Migration 0009: Foreign Keys (com ON DELETE) + Índices Compostos
--
-- Objetivo:
--   1. Garantir integridade referencial em todas as tabelas tenant-owned.
--   2. Padronizar políticas ON DELETE (RESTRICT/CASCADE/SET NULL) por domínio.
--   3. Adicionar índices compostos por (organization_id, ...) para escala multi-tenant.
--
-- Segurança:
--   - Idempotente: pode ser re-executada sem efeitos colaterais.
--   - Drop-then-Recreate de FKs via função helper que localiza constraints
--     existentes (autogerados ou não) antes de adicionar a nova política.
--   - Todos os índices usam CREATE INDEX IF NOT EXISTS.
--
-- Impacto:
--   - Zero downtime em Postgres: ALTER TABLE ADD FOREIGN KEY valida dados
--     existentes. Se houver órfão, migration falha e rollback automático.
--   - Índices usam build normal (não CONCURRENTLY) por rodar em transação.
--     Se a base for grande, considerar splitar em migration posterior com
--     CREATE INDEX CONCURRENTLY fora de transação.

-- ============================================================================
-- Helper: substitui todas as FKs de uma coluna por uma nova política
-- ============================================================================

CREATE OR REPLACE FUNCTION pg_temp.replace_fk(
  p_table text,
  p_column text,
  p_ref_table text,
  p_ref_column text,
  p_on_delete text,
  p_constraint_name text
) RETURNS void AS $$
DECLARE
  r RECORD;
  v_attnum int;
BEGIN
  SELECT attnum INTO v_attnum
  FROM pg_attribute
  WHERE attrelid = ('public.' || p_table)::regclass
    AND attname = p_column;

  IF v_attnum IS NULL THEN
    RAISE EXCEPTION 'Column %.% not found', p_table, p_column;
  END IF;

  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = p_table
      AND con.contype = 'f'
      AND con.conkey = ARRAY[v_attnum]::int2[]
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', p_table, r.conname);
  END LOOP;

  EXECUTE format(
    'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.%I(%I) ON DELETE %s',
    p_table, p_constraint_name, p_column, p_ref_table, p_ref_column, p_on_delete
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FKs para organizations (todas RESTRICT — proteger tenant)
-- ============================================================================
SELECT pg_temp.replace_fk('users',              'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_users_organization');
SELECT pg_temp.replace_fk('companies',          'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_companies_organization');
SELECT pg_temp.replace_fk('contacts',           'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_contacts_organization');
SELECT pg_temp.replace_fk('account_contacts',   'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_account_contacts_organization');
SELECT pg_temp.replace_fk('leads',              'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_leads_organization');
SELECT pg_temp.replace_fk('pipeline_stages',    'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_pipeline_stages_organization');
SELECT pg_temp.replace_fk('opportunities',      'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_opportunities_organization');
SELECT pg_temp.replace_fk('activities',         'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_activities_organization');
SELECT pg_temp.replace_fk('tasks',              'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_tasks_organization');
SELECT pg_temp.replace_fk('proposals',          'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_proposals_organization');
SELECT pg_temp.replace_fk('notifications',      'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_notifications_organization');
SELECT pg_temp.replace_fk('email_logs',         'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_email_logs_organization');
SELECT pg_temp.replace_fk('icps',               'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_icps_organization');
SELECT pg_temp.replace_fk('products',           'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_products_organization');
SELECT pg_temp.replace_fk('lead_cadences',      'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_lead_cadences_organization');
SELECT pg_temp.replace_fk('disqualify_reasons', 'organization_id', 'organizations', 'id', 'RESTRICT', 'fk_disqualify_reasons_organization');

-- ============================================================================
-- FKs entre entidades de domínio
-- ============================================================================

-- companies
SELECT pg_temp.replace_fk('companies',          'responsavel_id',  'users',          'id', 'SET NULL', 'fk_companies_responsavel');

-- contacts
SELECT pg_temp.replace_fk('contacts',           'company_id',      'companies',      'id', 'CASCADE',  'fk_contacts_company');

-- account_contacts (junção)
SELECT pg_temp.replace_fk('account_contacts',   'company_id',      'companies',      'id', 'CASCADE',  'fk_account_contacts_company');
SELECT pg_temp.replace_fk('account_contacts',   'contact_id',      'contacts',       'id', 'CASCADE',  'fk_account_contacts_contact');

-- leads
SELECT pg_temp.replace_fk('leads',              'company_id',      'companies',      'id', 'SET NULL', 'fk_leads_company');
SELECT pg_temp.replace_fk('leads',              'contact_id',      'contacts',       'id', 'SET NULL', 'fk_leads_contact');
SELECT pg_temp.replace_fk('leads',              'responsavel_id',  'users',          'id', 'SET NULL', 'fk_leads_responsavel');

-- opportunities (deals)
SELECT pg_temp.replace_fk('opportunities',      'company_id',      'companies',      'id', 'RESTRICT', 'fk_opportunities_company');
SELECT pg_temp.replace_fk('opportunities',      'contact_id',      'contacts',       'id', 'SET NULL', 'fk_opportunities_contact');
SELECT pg_temp.replace_fk('opportunities',      'lead_id',         'leads',          'id', 'SET NULL', 'fk_opportunities_lead');
SELECT pg_temp.replace_fk('opportunities',      'stage_id',        'pipeline_stages','id', 'RESTRICT', 'fk_opportunities_stage');
SELECT pg_temp.replace_fk('opportunities',      'responsavel_id',  'users',          'id', 'RESTRICT', 'fk_opportunities_responsavel');

-- activities
SELECT pg_temp.replace_fk('activities',         'company_id',      'companies',      'id', 'CASCADE',  'fk_activities_company');
SELECT pg_temp.replace_fk('activities',         'contact_id',      'contacts',       'id', 'CASCADE',  'fk_activities_contact');
SELECT pg_temp.replace_fk('activities',         'opportunity_id',  'opportunities',  'id', 'CASCADE',  'fk_activities_opportunity');
SELECT pg_temp.replace_fk('activities',         'lead_id',         'leads',          'id', 'CASCADE',  'fk_activities_lead');
SELECT pg_temp.replace_fk('activities',         'usuario_id',      'users',          'id', 'RESTRICT', 'fk_activities_usuario');

-- tasks
SELECT pg_temp.replace_fk('tasks',              'opportunity_id',  'opportunities',  'id', 'CASCADE',  'fk_tasks_opportunity');
SELECT pg_temp.replace_fk('tasks',              'contact_id',      'contacts',       'id', 'CASCADE',  'fk_tasks_contact');
SELECT pg_temp.replace_fk('tasks',              'company_id',      'companies',      'id', 'CASCADE',  'fk_tasks_company');
SELECT pg_temp.replace_fk('tasks',              'responsavel_id',  'users',          'id', 'RESTRICT', 'fk_tasks_responsavel');

-- proposals
SELECT pg_temp.replace_fk('proposals',          'opportunity_id',  'opportunities',  'id', 'CASCADE',  'fk_proposals_opportunity');
SELECT pg_temp.replace_fk('proposals',          'criado_por',      'users',          'id', 'RESTRICT', 'fk_proposals_criado_por');

-- proposal_items
SELECT pg_temp.replace_fk('proposal_items',     'proposal_id',     'proposals',      'id', 'CASCADE',  'fk_proposal_items_proposal');

-- notifications
SELECT pg_temp.replace_fk('notifications',      'usuario_id',      'users',          'id', 'CASCADE',  'fk_notifications_usuario');

-- email_logs
SELECT pg_temp.replace_fk('email_logs',         'usuario_id',      'users',          'id', 'RESTRICT', 'fk_email_logs_usuario');

-- ai_insights
SELECT pg_temp.replace_fk('ai_insights',        'opportunity_id',  'opportunities',  'id', 'CASCADE',  'fk_ai_insights_opportunity');

-- Helper é criado em pg_temp → removido automaticamente ao fim da sessão.
-- Em ambientes que não usem pg_temp, descomentar:
-- DROP FUNCTION IF EXISTS pg_temp.replace_fk(text, text, text, text, text, text);

-- ============================================================================
-- Índices compostos (organization_id, ...)
-- ============================================================================

-- users
CREATE INDEX IF NOT EXISTS users_org_idx            ON public.users (organization_id);
CREATE INDEX IF NOT EXISTS users_org_active_idx     ON public.users (organization_id, ativo);

-- companies
CREATE INDEX IF NOT EXISTS companies_org_idx              ON public.companies (organization_id);
CREATE INDEX IF NOT EXISTS companies_org_status_idx       ON public.companies (organization_id, status);
CREATE INDEX IF NOT EXISTS companies_org_responsavel_idx  ON public.companies (organization_id, responsavel_id);
CREATE INDEX IF NOT EXISTS companies_org_updated_idx      ON public.companies (organization_id, updated_at);

-- contacts
CREATE INDEX IF NOT EXISTS contacts_org_idx          ON public.contacts (organization_id);
CREATE INDEX IF NOT EXISTS contacts_org_company_idx  ON public.contacts (organization_id, company_id);

-- account_contacts
CREATE INDEX IF NOT EXISTS account_contacts_org_idx          ON public.account_contacts (organization_id);
CREATE INDEX IF NOT EXISTS account_contacts_org_company_idx  ON public.account_contacts (organization_id, company_id);
CREATE UNIQUE INDEX IF NOT EXISTS account_contacts_company_contact_uq
  ON public.account_contacts (company_id, contact_id);

-- leads
CREATE INDEX IF NOT EXISTS leads_org_idx              ON public.leads (organization_id);
CREATE INDEX IF NOT EXISTS leads_org_status_idx       ON public.leads (organization_id, status);
CREATE INDEX IF NOT EXISTS leads_org_responsavel_idx  ON public.leads (organization_id, responsavel_id);
CREATE INDEX IF NOT EXISTS leads_org_company_idx      ON public.leads (organization_id, company_id);
CREATE INDEX IF NOT EXISTS leads_org_updated_idx      ON public.leads (organization_id, updated_at);
CREATE INDEX IF NOT EXISTS leads_org_cadencia_idx     ON public.leads (organization_id, cadencia_id);

-- pipeline_stages
CREATE INDEX IF NOT EXISTS pipeline_stages_org_idx        ON public.pipeline_stages (organization_id);
CREATE INDEX IF NOT EXISTS pipeline_stages_org_ordem_idx  ON public.pipeline_stages (organization_id, ordem);

-- opportunities
CREATE INDEX IF NOT EXISTS opportunities_org_idx              ON public.opportunities (organization_id);
CREATE INDEX IF NOT EXISTS opportunities_org_status_idx       ON public.opportunities (organization_id, status);
CREATE INDEX IF NOT EXISTS opportunities_org_stage_idx        ON public.opportunities (organization_id, stage_id);
CREATE INDEX IF NOT EXISTS opportunities_org_responsavel_idx  ON public.opportunities (organization_id, responsavel_id);
CREATE INDEX IF NOT EXISTS opportunities_org_company_idx      ON public.opportunities (organization_id, company_id);
CREATE INDEX IF NOT EXISTS opportunities_org_created_idx      ON public.opportunities (organization_id, created_at);

-- activities
CREATE INDEX IF NOT EXISTS activities_org_idx              ON public.activities (organization_id);
CREATE INDEX IF NOT EXISTS activities_org_opportunity_idx  ON public.activities (organization_id, opportunity_id);
CREATE INDEX IF NOT EXISTS activities_org_lead_idx         ON public.activities (organization_id, lead_id);
CREATE INDEX IF NOT EXISTS activities_org_contact_idx      ON public.activities (organization_id, contact_id);
CREATE INDEX IF NOT EXISTS activities_org_company_idx      ON public.activities (organization_id, company_id);
CREATE INDEX IF NOT EXISTS activities_org_status_idx       ON public.activities (organization_id, status);
CREATE INDEX IF NOT EXISTS activities_org_data_idx         ON public.activities (organization_id, data_atividade);

-- tasks
CREATE INDEX IF NOT EXISTS tasks_org_idx              ON public.tasks (organization_id);
CREATE INDEX IF NOT EXISTS tasks_org_status_idx       ON public.tasks (organization_id, status);
CREATE INDEX IF NOT EXISTS tasks_org_responsavel_idx  ON public.tasks (organization_id, responsavel_id);
CREATE INDEX IF NOT EXISTS tasks_org_vencimento_idx   ON public.tasks (organization_id, data_vencimento);
CREATE INDEX IF NOT EXISTS tasks_org_opportunity_idx  ON public.tasks (organization_id, opportunity_id);

-- proposals
CREATE INDEX IF NOT EXISTS proposals_org_idx              ON public.proposals (organization_id);
CREATE INDEX IF NOT EXISTS proposals_org_opportunity_idx  ON public.proposals (organization_id, opportunity_id);
CREATE INDEX IF NOT EXISTS proposals_org_status_idx       ON public.proposals (organization_id, status);

-- proposal_items
CREATE INDEX IF NOT EXISTS proposal_items_proposal_idx    ON public.proposal_items (proposal_id);

-- notifications
CREATE INDEX IF NOT EXISTS notifications_org_idx                ON public.notifications (organization_id);
CREATE INDEX IF NOT EXISTS notifications_org_usuario_lida_idx   ON public.notifications (organization_id, usuario_id, lida);

-- email_logs
CREATE INDEX IF NOT EXISTS email_logs_org_idx          ON public.email_logs (organization_id);
CREATE INDEX IF NOT EXISTS email_logs_org_created_idx  ON public.email_logs (organization_id, created_at);

-- icps
CREATE INDEX IF NOT EXISTS icps_org_idx          ON public.icps (organization_id);
CREATE INDEX IF NOT EXISTS icps_org_ativo_idx    ON public.icps (organization_id, ativo);

-- products
CREATE INDEX IF NOT EXISTS products_org_idx          ON public.products (organization_id);
CREATE INDEX IF NOT EXISTS products_org_ativo_idx    ON public.products (organization_id, ativo);

-- lead_cadences
CREATE INDEX IF NOT EXISTS lead_cadences_org_idx         ON public.lead_cadences (organization_id);
CREATE INDEX IF NOT EXISTS lead_cadences_org_ativa_idx   ON public.lead_cadences (organization_id, ativa);

-- disqualify_reasons
CREATE INDEX IF NOT EXISTS disqualify_reasons_org_idx       ON public.disqualify_reasons (organization_id);
CREATE INDEX IF NOT EXISTS disqualify_reasons_org_tipo_idx  ON public.disqualify_reasons (organization_id, tipo);

-- ai_insights
CREATE INDEX IF NOT EXISTS ai_insights_opportunity_idx   ON public.ai_insights (opportunity_id);
