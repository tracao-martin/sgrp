# CRM B2B - TODO

## Fase 1: Arquitetura e Banco de Dados
- [x] Definir schema completo do banco de dados (users, companies, contacts, leads, opportunities, pipeline_stages, activities, tasks)
- [x] Popular banco com dados de seed (9 contas, 9 contatos, 6 leads, 4 deals, 6 atividades, 4 tarefas, 5 estágios)
- [x] Gerar migrações Drizzle
- [x] Configurar relacionamentos e constraints

## Fase 2: Autenticação e Controle de Acesso + UI Principal
- [x] Implementar perfis de usuário (admin, gerente, vendedor)
- [x] Criar sistema de permissões por perfil
- [x] Implementar middleware de autorização
- [x] Criar página de login com branding elegante (SGRP)
- [x] Criar layout principal com menu lateral elegante
- [x] Implementar navegação conforme estrutura do banco de dados
- [ ] Implementar página de gerenciamento de usuários (admin)
- [x] Implementar controle de acesso por perfil nas páginas

## Fase 3: Gestão de Empresas, Contatos e Leads (UI)
- [x] Criar página de Leads com listagem, detalhes e CRUD completo
- [x] Criar página de Contas (Empresas) com listagem, detalhes e CRUD completo
- [x] Criar página de Contatos vinculados a empresas com CRUD completo
- [x] Implementar timeline de interações (Activities) - componente ActivityTimeline criado
- [x] Criar interface de qualificação de leads - botão na página de Leads
- [x] Criar interface de conversão de lead para oportunidade - botão na página de Leads

## Fase 4: Pipeline de Oportunidades, Tarefas e Propostas (UI)
- [x] Criar página de Funil de Vendas (Pipeline) com Kanban e dados reais
- [x] Criar página de Tarefas com CRUD completo e dados reais
- [ ] Criar página de Propostas vinculadas a oportunidades
- [ ] Implementar registro de motivos de ganho/perda
- [ ] Implementar histórico de versões de propostas
- [ ] Criar interface de gerenciamento de estágios customizáveis

## Fase 5: Dashboard Comercial e Previsão de Receita
- [x] Criar Dashboard com métricas de funil (dados reais)
- [x] Implementar gráficos de funil e valor por estágio (dados reais)
- [x] Implementar gráficos de status dos deals (dados reais)
- [x] Criar página de Previsão de Receita - dados reais do pipeline
- [ ] Implementar widget de atividades recentes
- [ ] Implementar notificações internas

## Fase 6: Expert Comercial (IA) e Automações
- [x] Criar página de Expert Comercial com IA (dados reais + chat LLM)
- [ ] Implementar geração de resumos de oportunidades com IA
- [ ] Implementar sugestão de próximos passos com IA
- [ ] Implementar análise de probabilidade de fechamento
- [ ] Implementar automação de e-mails para tarefas vencidas
- [ ] Implementar automação de e-mails para mudanças de estágio
- [ ] Implementar automação de e-mails para novas atribuições

## Fase 7: Configurações e Refinamentos Finais
- [x] Criar página de Configurações (Estágios do Pipeline - funcional)
- [ ] Implementar Configurações avançadas (Notificações, Integrações - placeholders)
- [x] Implementar Calendário (página criada)
- [ ] Implementar Mensagens Rápidas
- [ ] Implementar E-mails por CCO
- [x] Testes vitest (15 testes passando)
- [x] CRUD completo: Companies (list, getById, create, update, delete)
- [x] CRUD completo: Contacts (list, listByCompany, getById, create, update, delete)
- [x] CRUD completo: Leads (list, getById, create, update, delete, updateQualification, convertToOpportunity)
- [x] CRUD completo: Opportunities (list, getById, create, update, updateStage, delete)
- [x] CRUD completo: Tasks (list, create, update, delete)
- [x] CRUD completo: Activities (list, getByOpportunity, getByContact, create, delete)
- [x] CRUD completo: PipelineStages (list)
- [x] Frontend Actions corrigidos: LeadActions, ContaActions, ContatoActions com mutations reais
- [x] Seed data populado: 43 registros (9 contas, 9 contatos, 6 leads, 4 deals, 6 atividades, 4 tarefas, 5 estágios)
- [ ] Refinamentos visuais e UX
- [ ] Otimização de performance
- [ ] Documentação técnica
- [ ] Preparação para deploy no VPS

## PRD Base44 - Campos Críticos Pendentes
- [ ] SPIN Fields (Situação, Problema, Implicação, Necessidade) nos Deals
- [ ] Qualification Fields (7 checkboxes) nos Deals
- [ ] Probabilidades (auto + manual) nos Deals
- [ ] Payment Fields (método, data, parcelas) nos Deals
- [ ] Tabela Installments (parcelas)
- [ ] AccountContact (stakeholders)
- [ ] UnlinkedEmail (emails CCO)
- [ ] Persona e ICP
- [ ] DisqualifyReason

## Prioridade: Sistema Funcional (sem LLM)
- [x] Corrigir erro use-toast no FunilVendas.tsx (era cache antigo, já resolvido)
- [x] Verificar e corrigir todos os erros de compilação/runtime (nested anchors, NaN, rota 404)
- [x] Expert Comercial atualizado com dados reais do pipeline + chat LLM com fallback gracioso
- [x] Validar todas as 11 páginas carregam sem erro
- [x] Validar CRUD end-to-end em todas as entidades (verificado visualmente)
- [x] Rodar testes vitest e corrigir falhas (21 testes passando)
- [x] Salvar checkpoint final do sistema funcional
- [x] Fortalecer validação do chat Expert: exigir message não vazia (z.string().min(1))
- [x] Testar CRUD end-to-end via browser (criar, editar, deletar lead testado com sucesso)

## Deploy VPS Hostinger
- [x] Conectar ao VPS e instalar Node.js, pnpm, Nginx, PM2, Certbot
- [x] Exportar código para GitHub (tracao-martin/sgrp)
- [x] Clonar repositório no VPS e fazer build
- [x] Configurar variáveis de ambiente e banco de dados
- [x] Configurar Nginx reverse proxy + SSL Let's Encrypt
- [x] Iniciar aplicação com PM2
- [x] Testar acesso via dev.sgrp.tracaocomercial.com.br

## Migração PostgreSQL + Auth Local + Deploy VPS
- [x] Trocar driver mysql2 por postgres (drizzle-orm/postgres-js)
- [x] Migrar schema Drizzle de mysqlTable para pgTable
- [x] Atualizar db.ts para usar PostgreSQL
- [x] Implementar autenticação local (email/senha com bcrypt + JWT)
- [x] Criar páginas de login/registro local
- [x] Remover dependências do OAuth Manus
- [x] Testar build e testes localmente (21 testes passando)
- [x] Instalar PostgreSQL no VPS (PostgreSQL 16, porta 5433)
- [x] Criar banco e tabelas no VPS (sgrp DB + admin user criado)
- [x] Configurar env no VPS (config.env com DATABASE_URL, JWT_SECRET)
- [x] Configurar Nginx reverse proxy + SSL Let's Encrypt (certbot)
- [x] Iniciar app com PM2 e testar via dev.sgrp.tracaocomercial.com.br
- [x] Validar fluxo completo de autenticação local no navegador (login testado com sucesso)
- [x] Executar pnpm build e corrigir erros (build OK local + VPS)
- [ ] Finalizar limpeza de OAuth Manus (renomear funções, remover textos inconsistentes)
