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
- [ ] Implementar timeline de interações (Activities)
- [ ] Criar interface de qualificação de leads
- [ ] Criar interface de conversão de lead para oportunidade

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
- [ ] Criar página de Previsão de Receita
- [ ] Implementar widget de atividades recentes
- [ ] Implementar notificações internas

## Fase 6: Expert Comercial (IA) e Automações
- [ ] Criar página de Expert Comercial com IA
- [ ] Implementar geração de resumos de oportunidades com IA
- [ ] Implementar sugestão de próximos passos com IA
- [ ] Implementar análise de probabilidade de fechamento
- [ ] Implementar automação de e-mails para tarefas vencidas
- [ ] Implementar automação de e-mails para mudanças de estágio
- [ ] Implementar automação de e-mails para novas atribuições

## Fase 7: Configurações e Refinamentos Finais
- [ ] Criar página de Configurações (Cadeências, Probabilidade, Funis, etc)
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
