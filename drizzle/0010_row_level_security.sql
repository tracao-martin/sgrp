-- Migration 0010: Row-Level Security (RLS) multi-tenant
--
-- Objetivo:
--   Defesa em profundidade contra vazamento cross-tenant. Mesmo que um router
--   esqueça o filtro `organization_id = ?`, o Postgres bloqueia a leitura/escrita
--   por meio da policy tenant_isolation.
--
-- Contrato com a aplicação:
--   Antes de cada query tenant, a aplicação executa em transação:
--     SELECT set_config('app.org_id',    '<ID da org>', true);
--     SELECT set_config('app.bypass_rls','on'|'off'   , true);  -- 'on' só para superadmin
--   O `true` no terceiro argumento (= is_local) limita o setting à transação.
--
-- Superadmin:
--   Quando `app.bypass_rls = 'on'`, policies permitem acesso cross-tenant.
--   Usado apenas pelo router admin (superadminProcedure).
--
-- Tabelas fora do RLS:
--   - organizations: acesso controlado em aplicação (auth + router admin).
--   - proposal_items, ai_insights: sem coluna organization_id própria → policy
--     via FK para a tabela pai (proposals, opportunities).
--
-- Idempotente: todas as statements usam IF NOT EXISTS / DROP POLICY IF EXISTS.

-- ============================================================================
-- Helper: aplica RLS + policy padrão em tabela tenant-owned
-- ============================================================================

CREATE OR REPLACE FUNCTION pg_temp.enable_tenant_rls(p_table text) RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', p_table);
  EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',  p_table);
  EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON public.%I', p_table);
  EXECUTE format($policy$
    CREATE POLICY tenant_isolation ON public.%I
      USING (
        current_setting('app.bypass_rls', true) = 'on'
        OR organization_id = NULLIF(current_setting('app.org_id', true), '')::int
      )
      WITH CHECK (
        current_setting('app.bypass_rls', true) = 'on'
        OR organization_id = NULLIF(current_setting('app.org_id', true), '')::int
      )
  $policy$, p_table);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Tabelas com coluna organization_id direta
-- ============================================================================
SELECT pg_temp.enable_tenant_rls('users');
SELECT pg_temp.enable_tenant_rls('companies');
SELECT pg_temp.enable_tenant_rls('contacts');
SELECT pg_temp.enable_tenant_rls('account_contacts');
SELECT pg_temp.enable_tenant_rls('leads');
SELECT pg_temp.enable_tenant_rls('pipeline_stages');
SELECT pg_temp.enable_tenant_rls('opportunities');
SELECT pg_temp.enable_tenant_rls('activities');
SELECT pg_temp.enable_tenant_rls('tasks');
SELECT pg_temp.enable_tenant_rls('proposals');
SELECT pg_temp.enable_tenant_rls('notifications');
SELECT pg_temp.enable_tenant_rls('email_logs');
SELECT pg_temp.enable_tenant_rls('icps');
SELECT pg_temp.enable_tenant_rls('products');
SELECT pg_temp.enable_tenant_rls('lead_cadences');
SELECT pg_temp.enable_tenant_rls('disqualify_reasons');

-- ============================================================================
-- proposal_items: org_id via FK para proposals
-- ============================================================================
ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_items FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON public.proposal_items;
CREATE POLICY tenant_isolation ON public.proposal_items
  USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_items.proposal_id
        AND p.organization_id = NULLIF(current_setting('app.org_id', true), '')::int
    )
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_items.proposal_id
        AND p.organization_id = NULLIF(current_setting('app.org_id', true), '')::int
    )
  );

-- ============================================================================
-- ai_insights: org_id via FK para opportunities
-- ============================================================================
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON public.ai_insights;
CREATE POLICY tenant_isolation ON public.ai_insights
  USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = ai_insights.opportunity_id
        AND o.organization_id = NULLIF(current_setting('app.org_id', true), '')::int
    )
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = ai_insights.opportunity_id
        AND o.organization_id = NULLIF(current_setting('app.org_id', true), '')::int
    )
  );

-- Helper em pg_temp → removido automaticamente ao fim da sessão.
