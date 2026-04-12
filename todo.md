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
- [x] Finalizar limpeza de OAuth Manus (renomeado para auth.ts, funções e comentários limpos)

## Auditoria e Limpeza de Projeto
- [x] Identificar arquivos órfãos e não referenciados
- [x] Identificar dependências npm não utilizadas
- [x] Remover código legado OAuth/MySQL
- [x] Remover arquivos de migração antigos (MySQL)
- [x] Limpar imports não utilizados
- [x] Validar build e testes após limpeza (21 testes OK, build OK)

## Sprint 1 - Multi-Tenant
### Bloco 1: Schema e Migração
- [x] Adicionar tabela organizations no Drizzle schema
- [x] Adicionar organization_id em todas as tabelas afetadas
- [x] Adicionar is_org_admin em users
- [x] Atualizar relations do Drizzle
- [x] Gerar SQL de migração e executar no banco dev
- [x] Atualizar seed-admin para criar organização padrão

### Bloco 2: Backend Multi-Tenant
- [x] Atualizar contexto tRPC para injetar organizationId
- [x] Refatorar todas as funções de db.ts para receber organizationId
- [x] Atualizar todas as procedures CRM para passar organizationId
- [x] Atualizar procedures Expert para filtrar por org
- [x] Criar endpoint POST /api/auth/register-org
- [x] Criar função de seed de estágios padrão por organização

### Bloco 3: Gerenciamento de Usuários
- [x] Criar procedures: users.list, users.invite, users.updateRole, users.toggleActive
- [x] Refatorar página Usuarios.tsx com CRUD completo (convite, alterar perfil, ativar/desativar)
- [x] Adicionar indicador de limite de usuários por plano

### Bloco 4: Frontend
- [x] Atualizar Login.tsx com formulário de registro de organização
- [x] Adicionar nome da organização na sidebar
- [x] Adicionar seção Minha Organização em Configurações (com edição + alterar senha)
- [x] Garantir estados vazios amigáveis em todas as páginas

### Bloco 5: Testes e Validação
- [x] Build e 21 testes passando após todas as mudanças
- [x] Deploy no VPS com banco multi-tenant (PostgreSQL 16, sgrp_user, permissões OK)
- [x] Testar fluxo completo no browser (login testado com sucesso, dashboard carregando)

### Validação Pendente
- [x] Testar registro de nova organização via "Criar Empresa" no browser (Empresa Teste ABC criada)
- [ ] Testar convite de usuário dentro da organização
- [x] Testar login como usuário da nova org (João Silva logou, dashboard limpo)
- [x] Validar isolamento multi-tenant (org 2 não vê dados da org 1) - CONFIRMADO em 12/04/2026
- [x] Testar CRUD básico (lead/conta) dentro do tenant (lead criado como org 2, não visível em org 1)

## Sprint 2 - SPIN Methodology & Qualificação de Deals
### Schema & Backend
- [x] Adicionar campos SPIN na tabela opportunities (spin_situacao, spin_problema, spin_implicacao, spin_necessidade)
- [x] Adicionar 7 checkboxes de qualificação na tabela opportunities (tem_budget, tem_autoridade, tem_necessidade, tem_timing, tem_concorrente, tem_proximo_passo, tem_criterio_decisao)
- [x] Adicionar campo probabilidade_auto (calculada pelo estágio) vs probabilidade_manual
- [x] Adicionar campos motivo_ganho e motivo_perda (já existem no schema)
- [x] Atualizar procedures tRPC para suportar os novos campos
- [x] Implementar cálculo automático de probabilidade baseado no estágio do pipeline

### Frontend
- [x] Criar aba/seção SPIN no detalhe da oportunidade
- [x] Criar seção de qualificação com 7 checkboxes no detalhe da oportunidade
- [x] Mostrar probabilidade automática (por estágio) com opção de override manual
- [x] Implementar modal de ganho/perda com campo de motivo obrigatório
- [x] Atualizar Kanban do Funil para mostrar indicadores SPIN e qualificação

### Testes & Deploy
- [x] Escrever testes vitest para os novos campos SPIN e qualificação (11 testes)
- [x] Deploy no VPS com migração de schema (13 ALTER TABLE executados)
- [ ] Testar fluxo completo no browser (pendente validação pelo usuário)

## Configurações - ICP (Perfil de Cliente Ideal)
- [x] Criar tabela icps no schema Drizzle (id, organization_id, nome, descricao, segmentos, portes, faixa_receita_min, faixa_receita_max, cargos_decisor, localizacoes, criterios_custom, ativo, created_at, updated_at)
- [x] Gerar e aplicar migração SQL no VPS
- [x] Criar procedures tRPC para CRUD de ICPs (list, create, update, delete)
- [x] Criar página frontend /configuracoes/icps com listagem de ICPs
- [x] Implementar formulário Novo ICP com campos: Nome, Descrição, Segmentos, Portes, Faixa de Receita, Cargos Decisor, Localizações, Critérios Customizados
- [x] Implementar edição inline ou modal de ICP existente
- [x] Implementar exclusão de ICP com confirmação
- [x] Integrar rota /configuracoes/icps no menu Configurações do sidebar
- [x] Garantir isolamento multi-tenant (org_id filter)
- [x] Escrever testes vitest para procedures ICP (14 testes)
- [x] Deploy no VPS e testar - ICP criado com sucesso 12/04/2026

## Configurações - Frontend Completo (Dados Mockados)

### Funis (Pipeline)
- [x] Página /configuracoes/funis com listagem de funis (ex: Vendas Novas, Expansão)
- [x] Cada funil mostra seus estágios em ordem com reorder visual
- [x] Cada estágio: nome, cor, critérios de entrada, critérios de saída, campos obrigatórios, evidências mínimas
- [x] Criar/editar/excluir funil
- [x] Criar/editar/excluir/reordenar estágios dentro de um funil
- [x] Estágios padrão: Novo Lead, Diagnóstico Agendado, Diagnóstico Realizado, Oportunidade Qualificada, Solução Desenhada, Proposta Apresentada, Negociação, Commit

### Probabilidade
- [x] Página /configuracoes/probabilidade com tabela de probabilidade por estágio
- [x] Cada estágio do funil ativo mostra: nome, probabilidade padrão (%), slider + input
- [x] Opção de ajuste fino por funil (tabs por funil)
- [x] Visualização gráfica da curva de probabilidade por estágio
- [x] Templates de probabilidade (Conservador/Moderado/Agressivo)

### Produtos
- [x] Página /configuracoes/produtos com catálogo de produtos/serviços (7 produtos mockados)
- [x] Campos: nome, descrição, categoria, preço base, recorrência (mensal/anual/único), ativo/inativo
- [x] CRUD completo com cards grid
- [x] Filtro por categoria e status (Todos/Ativos/Inativos + 6 categorias)
- [x] Tags de categoria com cores

### Metas
- [x] Página /configuracoes/metas com definição de metas de vendas
- [ ] Metas por período (mensal/trimestral/anual)
- [x] Metas por vendedor, equipe ou organização (seções Organização + Vendedores)
- [x] Campos: período, responsável, valor meta, tipo (receita nova, expansão, total, deals ganhos, leads qualificados)
- [x] Visualização de progresso (barra de progresso colorida)
- [x] Filtros por período (mês/trimestre/ano) e tipo de meta

### Cadências
- [x] Página /configuracoes/cadencias com sequências de follow-up (3 cadências mockadas)
- [x] Cada cadência: nome, descrição, gatilho, stats (contatos, % resposta)
- [x] Steps da cadência: dia, tipo de ação (email, ligação, WhatsApp, LinkedIn, tarefa), template, intervalo
- [x] Timeline visual dos steps com ícones por canal
- [x] Ativar/desativar cadência com toggle
- [x] CRUD completo com duplicar

### Mensagens Rápidas (ADIADO para próxima etapa)
- [ ] ~Página /configuracoes/mensagens-rapidas com templates de mensagens~
- [ ] Campos: título, categoria (prospecção, follow-up, proposta, objeção, fechamento), conteúdo com variáveis
- [ ] Variáveis dinâmicas: {{nome_contato}}, {{empresa}}, {{produto}}, {{valor}}, {{vendedor}}
- [ ] Preview do template com variáveis preenchidas
- [ ] CRUD completo com busca por categoria

### E-mails por CCO (ADIADO para próxima etapa)
- [ ] ~Página /configuracoes/emails-cco com configuração de captura de e-mails~
- [ ] Endereço de CCO único por organização (gerado automaticamente)
- [ ] Instruções de como usar (copiar endereço, adicionar no CCO do email)
- [ ] Lista de e-mails capturados recentes (mockado)
- [ ] Regras de associação automática (por domínio da empresa, por contato)

### Geral
- [ ] Página /configuracoes/geral com configurações gerais da organização
- [ ] Dados da empresa: nome, CNPJ, logo, segmento, tamanho
- [ ] Preferências: moeda, fuso horário, formato de data
- [ ] Notificações: ativar/desativar tipos de notificação
- [ ] Plano atual e limites (usuários, armazenamento)
- [ ] Zona de perigo: exportar dados, excluir organização

### Integração e Navegação
- [x] Todas as rotas registradas em App.tsx (6 novas rotas)
- [x] Menu lateral de Configurações atualizado com 7 sub-rotas reais
- [x] Navegação fluida entre todas as páginas de configuração
- [x] Deploy no VPS e teste de navegação completo - CONFIRMADO 12/04/2026

## Identidade Visual - Tração Comercial
- [x] Atualizar CSS variables globais para Preto #1C1C1C, Amarelo #ffbf19, Branco #ffffff
- [x] Atualizar SGRPLayout (sidebar, header, navegação) com novas cores - logo TC amarelo
- [x] Atualizar página de Login com novas cores - gradiente preto, logo TC
- [x] Atualizar todas as páginas principais (Dashboard, Leads, Contas, Contatos, Funil, Tarefas, Calendário, Previsão, Expert) - 30 arquivos
- [x] Atualizar todas as páginas de Configuração (Funis, Probabilidade, ICPs, Produtos, Metas, Cadências, Geral)
- [x] Deploy no VPS e validação visual completa - CONFIRMADO 12/04/2026

## Redesign Leads Page

### Aba Lista (Leads Ativos - estilo Excel)
- [x] Header com 2 abas: Cadência (Kanban) e Leads Ativos (Lista)
- [x] Tabela profissional com colunas configuráveis (Nome, Telefone, Cargo, Email, Empresa, Origem, Temperatura, Status)
- [x] Botão "Colunas" com popover para mostrar/ocultar colunas (salvo localStorage)
- [x] Busca por nome, empresa, telefone
- [x] Filtros avançados: Temperatura, Status, Canal de Origem
- [x] Todos os status na mesma tabela (novo, em_contato, qualificado, convertido, desqualificado, aposentado)
- [x] Paginação com 10/50/100 por página
- [x] Checkbox de seleção individual e selecionar todos
- [x] Barra flutuante de seleção em massa: editar em massa, exportar Excel
- [x] Ações por linha: Editar, Excluir
- [x] Botões header: Importar, Novo Lead
- [x] Modal Novo Lead / Editar Lead com formulário completo

### Página Detalhe do Lead (/leads/:id)
- [x] Header com nome, cargo, empresa + botões: WhatsApp, Converter em Conta, Desqualificar, Aposentar
- [x] Lado esquerdo: dados do contato com edição inline ("Clique para editar")
- [x] Campos: Nome, Cargo, ICP, Telefone, Email, Empresa, LinkedIn, Site, CPF/CNPJ, Canal de Origem, Cadência, Fase da Cadência, Visível Para, Observações, Temperatura (Frio/Morno/Quente)
- [x] Lado direito: Timeline de Atividades com "Nova Agenda" e "Nova Atividade"
- [x] Ação Converter em Conta: cria conta/empresa, muda status para convertido
- [x] Ação Desqualificar: pede motivo, muda status
- [x] Ação Aposentar: pede motivo, muda status
- [x] Ação Reativar: volta para ativo (se desqualificado/aposentado)

### Aba Cadência (Kanban)
- [x] Kanban agrupado por fase da cadência (Sem Cadência, Novo, Primeiro Contato, Follow-up, Qualificação, Apresentação)
- [x] Coluna "Sem Cadência" para leads não vinculados
- [x] Cards com: nome, empresa, temperatura badge, canal de origem
- [x] Dados mockados de cadências para visualização

### Integração
- [x] Rota /leads/:id registrada no App.tsx
- [x] Build sem erros
- [x] Deploy no VPS - CONFIRMADO 12/04/2026

## Ajustes Leads Page - Ordem das Abas e Kanban DnD

- [x] Inverter ordem das abas: "Leads Ativos" primeiro (padrão), "Cadência" segundo
- [x] Implementar drag-and-drop real no Kanban de Cadência (arrastar cards entre colunas)
- [x] Ao mover card no Kanban, registrar atividade na Timeline (usuário, data/hora, fase anterior → fase nova)
- [x] Botão "Histórico" com painel expansível mostrando todas as movimentações
- [x] Toast de confirmação ao mover lead com nome da fase destino
- [x] Build e deploy no VPS - CONFIRMADO 12/04/2026

## Bug Fix: Kanban Cadência não persiste movimentações

- [x] Adicionar campo cadence_phase na tabela leads (usa campo existente fase_cadencia)
- [x] Criar procedure tRPC para atualizar fase da cadência do lead (moveCadencePhase)
- [x] Criar atividade na timeline ao mover lead (tipo: cadence_move, com fase anterior e nova)
- [x] Atualizar frontend Kanban para chamar mutation ao mover card
- [x] Corrigir mapeamento snake_case (fase_cadencia) vs camelCase (faseCadencia) no frontend
- [x] Timeline de Atividades no detalhe do lead mostra movimentações corretamente
- [x] Build, deploy e testar no VPS - CONFIRMADO 12/04/2026

## Bug Fix: Criação de Lead não salva campos corretamente

- [ ] Auditar schema Drizzle da tabela leads (todos os campos)
- [ ] Auditar procedure tRPC crm.leads.create (campos aceitos vs campos enviados)
- [ ] Auditar formulário frontend de criação de lead (campos enviados na mutation)
- [ ] Verificar mapeamento snake_case vs camelCase na criação (mesma causa raiz do bug anterior)
- [ ] Corrigir backend para aceitar e persistir todos os campos do formulário
- [ ] Corrigir frontend para enviar todos os campos preenchidos
- [ ] Testar criação de lead end-to-end com todos os campos
- [ ] Deploy no VPS e validar
