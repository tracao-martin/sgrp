-- ============================================================================
-- SGRP - Seed Data (Base44 PRD)
-- Ordem: Pipeline Stages → Companies → Contacts → Leads → Opportunities → Activities → Tasks
-- ============================================================================

-- ============================================================================
-- 1. PIPELINE STAGES (Funil Principal)
-- ============================================================================
INSERT INTO pipeline_stages (nome, ordem, cor, probabilidade_fechamento) VALUES
('Lead Novo', 1, '#94a3b8', 10),
('Tentativa de Contato', 2, '#60a5fa', 20),
('Reunião / Call', 3, '#a78bfa', 40),
('Proposta Enviada', 4, '#f59e0b', 65),
('Negociação', 5, '#10b981', 80);

-- ============================================================================
-- 2. COMPANIES (Contas/Accounts)
-- ============================================================================
INSERT INTO companies (nome, cnpj, email, telefone, website, segmento, tamanho, status) VALUES
('TechFlow Soluções', '12.345.678/0001-90', 'contato@techflow.com.br', '5511987654321', 'https://techflow.com.br', 'Tecnologia', 'media', 'ativa'),
('Varejo Express', '98.765.432/0001-11', 'diretoria@varejoexpress.com.br', '5521976543210', 'https://varejoexpress.com.br', 'Varejo', 'grande', 'ativa'),
('Construdata Engenharia', '45.678.901/0001-23', 'comercial@construdata.com.br', '5531965432109', 'https://construdata.com.br', 'Engenharia', 'media', 'inativa'),
('SoftWave', NULL, 'ricardo.almeida@softwave.com.br', '5511991234567', NULL, 'Tecnologia', 'media', 'prospect'),
('LogMaster', NULL, 'fernanda.costa@logmaster.com.br', '5521998765432', NULL, 'Logística', 'pequena', 'prospect'),
('Industrial Minas', NULL, 'marcos.silveira@industrialminas.com.br', '5531985671234', NULL, 'Indústria', 'grande', 'prospect'),
('EduTech PR', NULL, 'juliana.ferreira@edutechpr.com.br', '5541979876543', NULL, 'Educação', 'micro', 'prospect'),
('SaúdePlus', NULL, 'bruno.nascimento@saudeplus.com.br', '5571968765432', NULL, 'Saúde', 'pequena', 'prospect'),
('Agência CRE', NULL, 'carolina.mendes@agenciacre.com.br', '5511957654321', NULL, 'Marketing', 'micro', 'prospect');

-- ============================================================================
-- 3. CONTACTS (Contatos vinculados às empresas)
-- ============================================================================

-- TechFlow Soluções (company_id = 1)
INSERT INTO contacts (company_id, nome, email, telefone, cargo, principal) VALUES
(1, 'Contato Principal TechFlow', 'contato@techflow.com.br', '5511987654321', 'Gerente Comercial', true);

-- Varejo Express (company_id = 2)
INSERT INTO contacts (company_id, nome, email, telefone, cargo, principal) VALUES
(2, 'Diretoria Varejo Express', 'diretoria@varejoexpress.com.br', '5521976543210', 'Diretor', true);

-- Construdata (company_id = 3)
INSERT INTO contacts (company_id, nome, email, telefone, cargo, principal) VALUES
(3, 'Comercial Construdata', 'comercial@construdata.com.br', '5531965432109', 'Gerente Comercial', true);

-- SoftWave (company_id = 4) - Ricardo Almeida
INSERT INTO contacts (company_id, nome, email, telefone, cargo, principal) VALUES
(4, 'Ricardo Almeida', 'ricardo.almeida@softwave.com.br', '5511991234567', 'Diretor Comercial', true);

-- LogMaster (company_id = 5) - Fernanda Costa
INSERT INTO contacts (company_id, nome, email, telefone, cargo, principal) VALUES
(5, 'Fernanda Costa', 'fernanda.costa@logmaster.com.br', '5521998765432', 'CEO', true);

-- Industrial Minas (company_id = 6) - Marcos Silveira
INSERT INTO contacts (company_id, nome, email, telefone, cargo, principal) VALUES
(6, 'Marcos Silveira', 'marcos.silveira@industrialminas.com.br', '5531985671234', 'Gerente de TI', true);

-- EduTech PR (company_id = 7) - Juliana Ferreira
INSERT INTO contacts (company_id, nome, email, telefone, cargo, principal) VALUES
(7, 'Juliana Ferreira', 'juliana.ferreira@edutechpr.com.br', '5541979876543', 'Diretora de Operações', true);

-- SaúdePlus (company_id = 8) - Bruno Nascimento
INSERT INTO contacts (company_id, nome, email, telefone, cargo, principal) VALUES
(8, 'Bruno Nascimento', 'bruno.nascimento@saudeplus.com.br', '5571968765432', 'Sócio-Diretor', true);

-- Agência CRE (company_id = 9) - Carolina Mendes
INSERT INTO contacts (company_id, nome, email, telefone, cargo, principal) VALUES
(9, 'Carolina Mendes', 'carolina.mendes@agenciacre.com.br', '5511957654321', 'Sócia Fundadora', true);

-- ============================================================================
-- 4. LEADS (Leads/Prospects)
-- ============================================================================
INSERT INTO leads (company_id, contact_id, titulo, descricao, origem, qualificacao, valor_estimado, status) VALUES
-- Ricardo Almeida - SoftWave (quente, proposta enviada)
(4, 4, 'Ricardo Almeida - SoftWave', 'Demonstrou interesse no post do LinkedIn sobre SPIN selling. Responde rápido no WhatsApp.', 'LinkedIn', 'quente', 4482.00, 'qualificado'),
-- Fernanda Costa - LogMaster (quente, reunião)
(5, 5, 'Fernanda Costa - LogMaster', 'Indicada pelo Ricardo da SoftWave. Quer estruturar o processo comercial do zero.', 'Indicação', 'quente', 1697.00, 'em_contato'),
-- Marcos Silveira - Industrial Minas (morno, tentativa contato)
(6, 6, 'Marcos Silveira - Industrial Minas', 'Preencheu formulário do site pedindo mais info sobre integrações.', 'Site', 'morno', 0.00, 'novo'),
-- Juliana Ferreira - EduTech PR (frio, prospecção)
(7, 7, 'Juliana Ferreira - EduTech PR', 'Curtiu vários posts. Nunca respondeu mensagem. Tentar abordagem diferente.', 'Instagram', 'frio', 0.00, 'novo'),
-- Bruno Nascimento - SaúdePlus (quente, negociação)
(8, 8, 'Bruno Nascimento - SaúdePlus', 'Veio via grupo de WhatsApp de empreendedores. Está com proposta em mãos. Decisão esta semana.', 'WhatsApp', 'quente', 5964.00, 'qualificado'),
-- Carolina Mendes - Agência CRE (frio, desqualificado)
(9, 9, 'Carolina Mendes - Agência CRE', 'Só ela na empresa. Não tem equipe comercial. Fora do ICP atual.', 'Indicação', 'frio', 0.00, 'perdido');

-- ============================================================================
-- 5. OPPORTUNITIES (Deals/Oportunidades)
-- ============================================================================

-- SoftWave — Licença Pro + Onboarding (stage 4 = Proposta Enviada)
INSERT INTO opportunities (company_id, contact_id, lead_id, titulo, descricao, valor, stage_id, responsavel_id, data_fechamento_prevista, probabilidade, status) VALUES
(4, 4, 1, 'SoftWave — Licença Pro + Onboarding',
'SPIN Situação: Equipe de 6 vendedores usando planilha Excel e WhatsApp sem nenhum processo definido.\nSPIN Problema: Perdem entre 30-40% dos leads por falta de follow-up. Sem visibilidade do pipeline para o gestor.\nSPIN Implicação: Estimam perder R$ 80k/mês em oportunidades não trabalhadas. Gestor gasta 3h/dia tentando entender o status de cada deal.\nSPIN Necessidade: CRM que centralize tudo, com pipeline visual, lembretes automáticos e relatórios para o diretor.\n\nQualificação: Contato real ✅ | Qualificada ✅ | Apresentação ✅ | Proposta ✅ | Decisor ✅ | Objeções: fáceis | Tratativas: não\nPagamento: Parcelado 3x a partir de 01/05/2026',
4482.00, 4, 1, '2026-04-30', 75, 'aberta');

-- LogMaster — CRM Starter (stage 3 = Reunião/Call)
INSERT INTO opportunities (company_id, contact_id, lead_id, titulo, descricao, valor, stage_id, responsavel_id, data_fechamento_prevista, probabilidade, status) VALUES
(5, 5, 2, 'LogMaster — CRM Starter',
'SPIN Situação: 3 vendedores, processo 100% informal. Usam bloco de notas e memória.\nSPIN Problema: Alta rotatividade de vendedores faz perder histórico de clientes. Sem previsão de receita.\nSPIN Implicação: Quando um vendedor sai, levam os contatos. Já perderam 2 clientes grandes assim.\nSPIN Necessidade: Ferramenta simples para registrar histórico de clientes e visualizar pipeline.\n\nQualificação: Contato real ✅ | Qualificada ✅ | Apresentação ✅ | Proposta ❌ | Decisor ✅ | Objeções: nenhuma | Tratativas: não\nPagamento: À vista',
1697.00, 3, 1, '2026-05-15', 40, 'aberta');

-- SaúdePlus — CRM Pro Urgente (stage 5 = Negociação)
INSERT INTO opportunities (company_id, contact_id, lead_id, titulo, descricao, valor, stage_id, responsavel_id, data_fechamento_prevista, probabilidade, status) VALUES
(8, 8, 5, 'SaúdePlus — CRM Pro Urgente',
'SPIN Situação: Clínica com 4 unidades, equipe comercial de 8 pessoas sem ferramenta.\nSPIN Problema: Perdendo pacientes/clientes B2B por falta de acompanhamento pós-consulta.\nSPIN Implicação: Taxa de retenção caiu 25% no último ano. Estão perdendo para concorrentes mais organizados.\nSPIN Necessidade: CRM com histórico de interações e agendamentos integrado à rotina da equipe.\n\nQualificação: Contato real ✅ | Qualificada ✅ | Apresentação ✅ | Proposta ✅ | Decisor ✅ | Objeções: fáceis | Tratativas: sim\nPagamento: Parcelado 12x a partir de 01/05/2026',
5964.00, 5, 1, '2026-04-15', 85, 'aberta');

-- Industrial Minas — Avaliação Técnica (stage 2 = Tentativa de Contato)
INSERT INTO opportunities (company_id, contact_id, lead_id, titulo, descricao, valor, stage_id, responsavel_id, data_fechamento_prevista, probabilidade, status) VALUES
(6, 6, 3, 'Industrial Minas — Avaliação Técnica',
'Ainda sem contato efetivo. Preencheu formulário do site. Aguardando primeira ligação.\n\nQualificação: Contato real ❌ | Qualificada ❌ | Apresentação ❌ | Proposta ❌ | Decisor ❌\nPagamento: À vista',
0.00, 2, 1, '2026-06-30', 20, 'aberta');

-- ============================================================================
-- 6. ACTIVITIES (Atividades/Interações)
-- ============================================================================

-- Atividades vinculadas ao Ricardo/SoftWave (contact_id=4, company_id=4, opportunity_id=1)
INSERT INTO activities (company_id, contact_id, opportunity_id, tipo, titulo, descricao, usuario_id, data_atividade) VALUES
(4, 4, 1, 'chamada', '1º contato via WhatsApp — Ricardo SoftWave',
'Enviei mensagem de apresentação. Respondeu em 10min. Demonstrou muito interesse. Agendamos call para quinta-feira às 14h.',
1, '2026-04-07 10:30:00');

INSERT INTO activities (company_id, contact_id, opportunity_id, tipo, titulo, descricao, usuario_id, data_atividade) VALUES
(4, 4, 1, 'reuniao', 'Call de Discovery — SoftWave',
'Reunião de 45min. Ricardo apresentou toda a dor do time. 6 vendedores, sem processo. Perdem muitos leads. Combinamos envio de proposta em 24h.',
1, '2026-04-10 14:00:00');

INSERT INTO activities (company_id, contact_id, opportunity_id, tipo, titulo, descricao, usuario_id, data_atividade) VALUES
(4, 4, 1, 'email', 'Envio da proposta comercial — SoftWave',
'Proposta enviada por e-mail com 3 opções: Starter, Pro e Pro + Onboarding. Valor total apresentado: R$ 4.482. Aguardando retorno até sexta.',
1, '2026-04-11 09:15:00');

-- Atividade vinculada à Fernanda/LogMaster (contact_id=5, company_id=5, opportunity_id=2)
INSERT INTO activities (company_id, contact_id, opportunity_id, tipo, titulo, descricao, usuario_id, data_atividade) VALUES
(5, 5, 2, 'chamada', 'Ligação de follow-up — LogMaster',
'Fernanda confirmou interesse. Pediu para apresentar para o sócio na semana que vem. Agendei call para terça às 11h.',
1, '2026-04-09 16:00:00');

-- Atividade vinculada ao Bruno/SaúdePlus (contact_id=8, company_id=8, opportunity_id=3)
INSERT INTO activities (company_id, contact_id, opportunity_id, tipo, titulo, descricao, usuario_id, data_atividade) VALUES
(8, 8, 3, 'chamada', 'Negociação final — SaúdePlus',
'Bruno pediu desconto de 10%. Ofereci 5% e 12 parcelas sem juros. Aceitou. Aguardando assinatura do contrato.',
1, '2026-04-12 08:45:00');

-- Tarefa vinculada ao Marcos/Industrial Minas (contact_id=6, company_id=6, opportunity_id=4)
INSERT INTO activities (company_id, contact_id, opportunity_id, tipo, titulo, descricao, usuario_id, data_atividade) VALUES
(6, 6, 4, 'nota', 'Preparar apresentação personalizada — Industrial Minas',
'Criar deck com foco em integrações (ERP + CRM) para a realidade de uma indústria de grande porte.',
1, '2026-04-14 09:00:00');

-- ============================================================================
-- 7. TASKS (Tarefas/Follow-ups)
-- ============================================================================
INSERT INTO tasks (titulo, descricao, opportunity_id, contact_id, company_id, responsavel_id, data_vencimento, prioridade, status) VALUES
('Call de negociação — SoftWave',
'Ricardo vai apresentar a proposta para o diretor financeiro. Preciso estar preparado para justificar o ROI.',
1, 4, 4, 1, '2026-04-15 10:00:00', 'alta', 'pendente');

INSERT INTO tasks (titulo, descricao, opportunity_id, contact_id, company_id, responsavel_id, data_vencimento, prioridade, status) VALUES
('Apresentação para o sócio — LogMaster',
'Fernanda vai trazer o sócio Luciano. Foco em simplicidade e curva de aprendizado rápida.',
2, 5, 5, 1, '2026-04-15 11:00:00', 'alta', 'pendente');

INSERT INTO tasks (titulo, descricao, opportunity_id, contact_id, company_id, responsavel_id, data_vencimento, prioridade, status) VALUES
('Assinatura de contrato — SaúdePlus',
'Bruno confirmou. Assinatura do contrato e kick-off do onboarding.',
3, 8, 8, 1, '2026-04-14 15:00:00', 'critica', 'pendente');

INSERT INTO tasks (titulo, descricao, opportunity_id, contact_id, company_id, responsavel_id, data_vencimento, prioridade, status) VALUES
('Primeiro contato — Marcos Industrial Minas',
'Tentar 1ª ligação após formulário. Se não atender, enviar WhatsApp.',
4, 6, 6, 1, '2026-04-13 09:00:00', 'media', 'pendente');

-- ============================================================================
-- FIM DO SEED
-- ============================================================================
