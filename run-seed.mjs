import mysql from 'mysql2/promise';

async function run() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // ============================================================================
  // 2. COMPANIES (Contas/Accounts)
  // ============================================================================
  console.log('📦 Inserindo Companies...');
  
  const companiesData = [
    ['TechFlow Soluções', '12.345.678/0001-90', 'contato@techflow.com.br', '5511987654321', 'https://techflow.com.br', 'Tecnologia', 'media', 'ativa'],
    ['Varejo Express', '98.765.432/0001-11', 'diretoria@varejoexpress.com.br', '5521976543210', 'https://varejoexpress.com.br', 'Varejo', 'grande', 'ativa'],
    ['Construdata Engenharia', '45.678.901/0001-23', 'comercial@construdata.com.br', '5531965432109', 'https://construdata.com.br', 'Engenharia', 'media', 'inativa'],
    ['SoftWave', null, 'ricardo.almeida@softwave.com.br', '5511991234567', null, 'Tecnologia', 'media', 'prospect'],
    ['LogMaster', null, 'fernanda.costa@logmaster.com.br', '5521998765432', null, 'Logística', 'pequena', 'prospect'],
    ['Industrial Minas', null, 'marcos.silveira@industrialminas.com.br', '5531985671234', null, 'Indústria', 'grande', 'prospect'],
    ['EduTech PR', null, 'juliana.ferreira@edutechpr.com.br', '5541979876543', null, 'Educação', 'micro', 'prospect'],
    ['SaúdePlus', null, 'bruno.nascimento@saudeplus.com.br', '5571968765432', null, 'Saúde', 'pequena', 'prospect'],
    ['Agência CRE', null, 'carolina.mendes@agenciacre.com.br', '5511957654321', null, 'Marketing', 'micro', 'prospect'],
  ];
  
  for (const c of companiesData) {
    await conn.execute(
      'INSERT INTO companies (nome, cnpj, email, telefone, website, segmento, tamanho, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      c
    );
  }
  console.log(`✅ ${companiesData.length} Companies inseridas`);
  
  // ============================================================================
  // 3. CONTACTS (Contatos vinculados às empresas)
  // ============================================================================
  console.log('📦 Inserindo Contacts...');
  
  const contactsData = [
    [1, 'Contato Principal TechFlow', 'contato@techflow.com.br', '5511987654321', 'Gerente Comercial', true],
    [2, 'Diretoria Varejo Express', 'diretoria@varejoexpress.com.br', '5521976543210', 'Diretor', true],
    [3, 'Comercial Construdata', 'comercial@construdata.com.br', '5531965432109', 'Gerente Comercial', true],
    [4, 'Ricardo Almeida', 'ricardo.almeida@softwave.com.br', '5511991234567', 'Diretor Comercial', true],
    [5, 'Fernanda Costa', 'fernanda.costa@logmaster.com.br', '5521998765432', 'CEO', true],
    [6, 'Marcos Silveira', 'marcos.silveira@industrialminas.com.br', '5531985671234', 'Gerente de TI', true],
    [7, 'Juliana Ferreira', 'juliana.ferreira@edutechpr.com.br', '5541979876543', 'Diretora de Operações', true],
    [8, 'Bruno Nascimento', 'bruno.nascimento@saudeplus.com.br', '5571968765432', 'Sócio-Diretor', true],
    [9, 'Carolina Mendes', 'carolina.mendes@agenciacre.com.br', '5511957654321', 'Sócia Fundadora', true],
  ];
  
  for (const c of contactsData) {
    await conn.execute(
      'INSERT INTO contacts (company_id, nome, email, telefone, cargo, principal) VALUES (?, ?, ?, ?, ?, ?)',
      c
    );
  }
  console.log(`✅ ${contactsData.length} Contacts inseridos`);
  
  // ============================================================================
  // 4. LEADS (Leads/Prospects)
  // ============================================================================
  console.log('📦 Inserindo Leads...');
  
  const leadsData = [
    [4, 4, 'Ricardo Almeida - SoftWave', 'Demonstrou interesse no post do LinkedIn sobre SPIN selling. Responde rápido no WhatsApp.', 'LinkedIn', 'quente', 4482.00, 'qualificado'],
    [5, 5, 'Fernanda Costa - LogMaster', 'Indicada pelo Ricardo da SoftWave. Quer estruturar o processo comercial do zero.', 'Indicação', 'quente', 1697.00, 'em_contato'],
    [6, 6, 'Marcos Silveira - Industrial Minas', 'Preencheu formulário do site pedindo mais info sobre integrações.', 'Site', 'morno', 0.00, 'novo'],
    [7, 7, 'Juliana Ferreira - EduTech PR', 'Curtiu vários posts. Nunca respondeu mensagem. Tentar abordagem diferente.', 'Instagram', 'frio', 0.00, 'novo'],
    [8, 8, 'Bruno Nascimento - SaúdePlus', 'Veio via grupo de WhatsApp de empreendedores. Está com proposta em mãos. Decisão esta semana.', 'WhatsApp', 'quente', 5964.00, 'qualificado'],
    [9, 9, 'Carolina Mendes - Agência CRE', 'Só ela na empresa. Não tem equipe comercial. Fora do ICP atual.', 'Indicação', 'frio', 0.00, 'perdido'],
  ];
  
  for (const l of leadsData) {
    await conn.execute(
      'INSERT INTO leads (company_id, contact_id, titulo, descricao, origem, qualificacao, valor_estimado, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      l
    );
  }
  console.log(`✅ ${leadsData.length} Leads inseridos`);
  
  // ============================================================================
  // 5. OPPORTUNITIES (Deals/Oportunidades)
  // ============================================================================
  console.log('📦 Inserindo Opportunities...');
  
  // Get first user id for responsavel_id
  const [users] = await conn.execute('SELECT id FROM users LIMIT 1');
  const userId = users.length > 0 ? users[0].id : 1;
  
  const oppsData = [
    {
      company_id: 4, contact_id: 4, lead_id: 1,
      titulo: 'SoftWave — Licença Pro + Onboarding',
      descricao: 'SPIN Situação: Equipe de 6 vendedores usando planilha Excel e WhatsApp sem nenhum processo definido.\nSPIN Problema: Perdem entre 30-40% dos leads por falta de follow-up. Sem visibilidade do pipeline para o gestor.\nSPIN Implicação: Estimam perder R$ 80k/mês em oportunidades não trabalhadas. Gestor gasta 3h/dia tentando entender o status de cada deal.\nSPIN Necessidade: CRM que centralize tudo, com pipeline visual, lembretes automáticos e relatórios para o diretor.\n\nQualificação: Contato real ✅ | Qualificada ✅ | Apresentação ✅ | Proposta ✅ | Decisor ✅ | Objeções: fáceis | Tratativas: não\nPagamento: Parcelado 3x a partir de 01/05/2026',
      valor: 4482.00, stage_id: 4, probabilidade: 75,
      data_fechamento_prevista: '2026-04-30', status: 'aberta'
    },
    {
      company_id: 5, contact_id: 5, lead_id: 2,
      titulo: 'LogMaster — CRM Starter',
      descricao: 'SPIN Situação: 3 vendedores, processo 100% informal. Usam bloco de notas e memória.\nSPIN Problema: Alta rotatividade de vendedores faz perder histórico de clientes. Sem previsão de receita.\nSPIN Implicação: Quando um vendedor sai, levam os contatos. Já perderam 2 clientes grandes assim.\nSPIN Necessidade: Ferramenta simples para registrar histórico de clientes e visualizar pipeline.\n\nQualificação: Contato real ✅ | Qualificada ✅ | Apresentação ✅ | Proposta ❌ | Decisor ✅ | Objeções: nenhuma | Tratativas: não\nPagamento: À vista',
      valor: 1697.00, stage_id: 3, probabilidade: 40,
      data_fechamento_prevista: '2026-05-15', status: 'aberta'
    },
    {
      company_id: 8, contact_id: 8, lead_id: 5,
      titulo: 'SaúdePlus — CRM Pro Urgente',
      descricao: 'SPIN Situação: Clínica com 4 unidades, equipe comercial de 8 pessoas sem ferramenta.\nSPIN Problema: Perdendo pacientes/clientes B2B por falta de acompanhamento pós-consulta.\nSPIN Implicação: Taxa de retenção caiu 25% no último ano. Estão perdendo para concorrentes mais organizados.\nSPIN Necessidade: CRM com histórico de interações e agendamentos integrado à rotina da equipe.\n\nQualificação: Contato real ✅ | Qualificada ✅ | Apresentação ✅ | Proposta ✅ | Decisor ✅ | Objeções: fáceis | Tratativas: sim\nPagamento: Parcelado 12x a partir de 01/05/2026',
      valor: 5964.00, stage_id: 5, probabilidade: 85,
      data_fechamento_prevista: '2026-04-15', status: 'aberta'
    },
    {
      company_id: 6, contact_id: 6, lead_id: 3,
      titulo: 'Industrial Minas — Avaliação Técnica',
      descricao: 'Ainda sem contato efetivo. Preencheu formulário do site. Aguardando primeira ligação.\n\nQualificação: Contato real ❌ | Qualificada ❌ | Apresentação ❌ | Proposta ❌ | Decisor ❌\nPagamento: À vista',
      valor: 0.00, stage_id: 2, probabilidade: 20,
      data_fechamento_prevista: '2026-06-30', status: 'aberta'
    },
  ];
  
  for (const o of oppsData) {
    await conn.execute(
      'INSERT INTO opportunities (company_id, contact_id, lead_id, titulo, descricao, valor, stage_id, responsavel_id, data_fechamento_prevista, probabilidade, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [o.company_id, o.contact_id, o.lead_id, o.titulo, o.descricao, o.valor, o.stage_id, userId, o.data_fechamento_prevista, o.probabilidade, o.status]
    );
  }
  console.log(`✅ ${oppsData.length} Opportunities inseridas`);
  
  // ============================================================================
  // 6. ACTIVITIES (Atividades/Interações)
  // ============================================================================
  console.log('📦 Inserindo Activities...');
  
  const activitiesData = [
    [4, 4, 1, 'chamada', '1º contato via WhatsApp — Ricardo SoftWave', 'Enviei mensagem de apresentação. Respondeu em 10min. Demonstrou muito interesse. Agendamos call para quinta-feira às 14h.', userId, '2026-04-07 10:30:00'],
    [4, 4, 1, 'reuniao', 'Call de Discovery — SoftWave', 'Reunião de 45min. Ricardo apresentou toda a dor do time. 6 vendedores, sem processo. Perdem muitos leads. Combinamos envio de proposta em 24h.', userId, '2026-04-10 14:00:00'],
    [4, 4, 1, 'email', 'Envio da proposta comercial — SoftWave', 'Proposta enviada por e-mail com 3 opções: Starter, Pro e Pro + Onboarding. Valor total apresentado: R$ 4.482. Aguardando retorno até sexta.', userId, '2026-04-11 09:15:00'],
    [5, 5, 2, 'chamada', 'Ligação de follow-up — LogMaster', 'Fernanda confirmou interesse. Pediu para apresentar para o sócio na semana que vem. Agendei call para terça às 11h.', userId, '2026-04-09 16:00:00'],
    [8, 8, 3, 'chamada', 'Negociação final — SaúdePlus', 'Bruno pediu desconto de 10%. Ofereci 5% e 12 parcelas sem juros. Aceitou. Aguardando assinatura do contrato.', userId, '2026-04-12 08:45:00'],
    [6, 6, 4, 'nota', 'Preparar apresentação personalizada — Industrial Minas', 'Criar deck com foco em integrações (ERP + CRM) para a realidade de uma indústria de grande porte.', userId, '2026-04-14 09:00:00'],
  ];
  
  for (const a of activitiesData) {
    await conn.execute(
      'INSERT INTO activities (company_id, contact_id, opportunity_id, tipo, titulo, descricao, usuario_id, data_atividade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      a
    );
  }
  console.log(`✅ ${activitiesData.length} Activities inseridas`);
  
  // ============================================================================
  // 7. TASKS (Tarefas/Follow-ups)
  // ============================================================================
  console.log('📦 Inserindo Tasks...');
  
  const tasksData = [
    ['Call de negociação — SoftWave', 'Ricardo vai apresentar a proposta para o diretor financeiro. Preciso estar preparado para justificar o ROI.', 1, 4, 4, userId, '2026-04-15 10:00:00', 'alta', 'pendente'],
    ['Apresentação para o sócio — LogMaster', 'Fernanda vai trazer o sócio Luciano. Foco em simplicidade e curva de aprendizado rápida.', 2, 5, 5, userId, '2026-04-15 11:00:00', 'alta', 'pendente'],
    ['Assinatura de contrato — SaúdePlus', 'Bruno confirmou. Assinatura do contrato e kick-off do onboarding.', 3, 8, 8, userId, '2026-04-14 15:00:00', 'critica', 'pendente'],
    ['Primeiro contato — Marcos Industrial Minas', 'Tentar 1ª ligação após formulário. Se não atender, enviar WhatsApp.', 4, 6, 6, userId, '2026-04-13 09:00:00', 'media', 'pendente'],
  ];
  
  for (const t of tasksData) {
    await conn.execute(
      'INSERT INTO tasks (titulo, descricao, opportunity_id, contact_id, company_id, responsavel_id, data_vencimento, prioridade, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      t
    );
  }
  console.log(`✅ ${tasksData.length} Tasks inseridas`);
  
  // ============================================================================
  // SUMMARY
  // ============================================================================
  const [stagesCount] = await conn.execute('SELECT COUNT(*) as c FROM pipeline_stages');
  const [companiesCount] = await conn.execute('SELECT COUNT(*) as c FROM companies');
  const [contactsCount] = await conn.execute('SELECT COUNT(*) as c FROM contacts');
  const [leadsCount] = await conn.execute('SELECT COUNT(*) as c FROM leads');
  const [oppsCount] = await conn.execute('SELECT COUNT(*) as c FROM opportunities');
  const [activitiesCount] = await conn.execute('SELECT COUNT(*) as c FROM activities');
  const [tasksCount] = await conn.execute('SELECT COUNT(*) as c FROM tasks');
  
  console.log('\n🎉 ============================================');
  console.log('   SEED COMPLETO!');
  console.log('============================================');
  console.log(`   Pipeline Stages: ${stagesCount[0].c}`);
  console.log(`   Companies:       ${companiesCount[0].c}`);
  console.log(`   Contacts:        ${contactsCount[0].c}`);
  console.log(`   Leads:           ${leadsCount[0].c}`);
  console.log(`   Opportunities:   ${oppsCount[0].c}`);
  console.log(`   Activities:      ${activitiesCount[0].c}`);
  console.log(`   Tasks:           ${tasksCount[0].c}`);
  console.log('============================================\n');
  
  await conn.end();
}

run().catch(e => { console.error('❌ ERRO:', e.message); process.exit(1); });
