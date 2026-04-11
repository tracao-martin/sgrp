# CRM B2B - TODO

## Fase 1: Arquitetura e Banco de Dados
- [ ] Definir schema completo do banco de dados (users, companies, contacts, leads, opportunities, pipeline_stages, activities, tasks, proposals)
- [ ] Gerar migrações Drizzle
- [ ] Configurar relacionamentos e constraints

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
- [ ] Criar página de Leads com listagem e detalhes
- [ ] Criar página de Contas (Empresas) com listagem e detalhes
- [ ] Criar página de Contatos vinculados a empresas
- [ ] Implementar timeline de interações (Activities)
- [ ] Criar interface de qualificação de leads
- [ ] Criar interface de conversão de lead para oportunidade

## Fase 4: Pipeline de Oportunidades, Tarefas e Propostas (UI)
- [ ] Criar página de Funil de Vendas (Pipeline) com drag-and-drop
- [ ] Criar página de Tarefas com lembretes e prioridades
- [ ] Criar página de Propostas vinculadas a oportunidades
- [ ] Implementar registro de motivos de ganho/perda
- [ ] Implementar histórico de versões de propostas
- [ ] Criar interface de gerenciamento de estágios customizáveis

## Fase 5: Dashboard Comercial e Previsão de Receita
- [ ] Criar Dashboard com métricas de funil
- [ ] Implementar gráficos de receita prevista
- [ ] Implementar gráficos de taxa de conversão
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
- [ ] Implementar Calendário
- [ ] Implementar Mensagens Rápidas
- [ ] Implementar E-mails por CCO
- [ ] Testes de todas as funcionalidades
- [ ] Refinamentos visuais e UX
- [ ] Otimização de performance
- [ ] Documentação técnica
- [ ] Preparação para deploy
