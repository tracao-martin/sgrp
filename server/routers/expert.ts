import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { opportunities, leads, companies, activities, tasks, pipelineStages } from "../../drizzle/schema";
import { count, sum, eq, and, sql } from "drizzle-orm";

export const expertRouter = router({
  chat: protectedProcedure
    .input(z.object({
      message: z.string().min(1, "Mensagem não pode ser vazia"),
      history: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      if (!db) throw new Error("Database not available");

      // Gather pipeline context
      const orgId = ctx.user.organizationId;
      const [dealsData] = await db.select({ total: count(), totalValue: sum(opportunities.valor) }).from(opportunities).where(eq(opportunities.organizationId, orgId));
      const [leadsData] = await db.select({ total: count() }).from(leads).where(eq(leads.organizationId, orgId));
      const [companiesData] = await db.select({ total: count() }).from(companies).where(eq(companies.organizationId, orgId));
      const [tasksData] = await db.select({ total: count() }).from(tasks).where(eq(tasks.organizationId, orgId));
      const [activitiesData] = await db.select({ total: count() }).from(activities).where(eq(activities.organizationId, orgId));
      const stagesData = await db.select().from(pipelineStages).where(eq(pipelineStages.organizationId, orgId)).orderBy(pipelineStages.ordem);

      // Get deals by stage
      const dealsByStage = await db
        .select({
          stageName: pipelineStages.nome,
          dealCount: count(),
          totalValue: sum(opportunities.valor),
        })
        .from(opportunities)
        .leftJoin(pipelineStages, eq(opportunities.stage_id, pipelineStages.id))
        .where(eq(opportunities.organizationId, orgId))
        .groupBy(pipelineStages.nome);

      const pipelineContext = `
CONTEXTO DO PIPELINE (DADOS REAIS):
- Total de Deals: ${dealsData.total} | Valor Total: R$ ${Number(dealsData.totalValue || 0).toLocaleString("pt-BR")}
- Total de Leads: ${leadsData.total}
- Total de Contas: ${companiesData.total}
- Total de Tarefas: ${tasksData.total}
- Total de Atividades: ${activitiesData.total}
- Estágios do Funil: ${stagesData.map(s => s.nome).join(" → ")}
- Deals por Estágio: ${dealsByStage.map(d => `${d.stageName}: ${d.dealCount} deals (R$ ${Number(d.totalValue || 0).toLocaleString("pt-BR")})`).join(", ")}
`;

      const systemPrompt = `Você é o Expert Comercial do SGRP, um assistente de IA especializado em vendas consultivas B2B.

Seu papel é:
1. Analisar dados do pipeline e fornecer insights acionáveis
2. Recomendar próximos passos para cada deal
3. Identificar riscos e oportunidades
4. Sugerir estratégias de vendas baseadas em metodologia SPIN Selling
5. Calcular previsões de receita
6. Analisar performance de vendedores

${pipelineContext}

REGRAS:
- Sempre responda em português brasileiro
- Seja objetivo e direto
- Use dados reais do pipeline para embasar suas análises
- Forneça recomendações acionáveis
- Quando não tiver dados suficientes, sugira ações para coletar mais informações
- Use formatação com emojis para facilitar a leitura
- Mantenha respostas concisas (máximo 300 palavras)`;

      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
      ];

      // Add history
      if (input.history) {
        for (const msg of input.history) {
          messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
        }
      }

      messages.push({ role: "user", content: input.message });

      try {
        const response = await invokeLLM({ messages });
        const rawContent = response.choices?.[0]?.message?.content;
        const content = typeof rawContent === "string" ? rawContent : "Desculpe, não consegui processar sua pergunta. Tente novamente.";
        return { content };
      } catch (error: any) {
        console.error("Expert LLM error:", error);
        return { content: "Desculpe, houve um erro ao processar sua pergunta. O serviço de IA pode estar temporariamente indisponível. Tente novamente em alguns instantes." };
      }
    }),

  getInsights: protectedProcedure.query(async ({ ctx }) => {
    const db = ctx.db;
    if (!db) return [];

    // Get deals data for insights
    const orgId = ctx.user.organizationId;
    const allDeals = await db.select().from(opportunities).where(eq(opportunities.organizationId, orgId));
    const allLeads = await db.select().from(leads).where(eq(leads.organizationId, orgId));
    const allTasks = await db.select().from(tasks).where(eq(tasks.organizationId, orgId));

    const insights: Array<{ type: string; title: string; description: string; priority: string }> = [];

    // Check for stale deals (no recent activity)
    const staleDealCount = allDeals.filter(d => {
      const updated = new Date(d.updatedAt);
      const daysSince = (Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 7;
    }).length;

    if (staleDealCount > 0) {
      insights.push({
        type: "risk",
        title: `${staleDealCount} deal(s) sem atividade há mais de 7 dias`,
        description: "Deals parados podem esfriar. Recomenda-se follow-up imediato.",
        priority: "alta",
      });
    }

    // Check for overdue tasks
    const overdueTasks = allTasks.filter(t => {
      if (!t.data_vencimento) return false;
      return new Date(t.data_vencimento) < new Date() && t.status !== "concluida";
    }).length;

    if (overdueTasks > 0) {
      insights.push({
        type: "warning",
        title: `${overdueTasks} tarefa(s) atrasada(s)`,
        description: "Tarefas atrasadas impactam a produtividade. Priorize a conclusão.",
        priority: "alta",
      });
    }

    // Check for hot leads without deals
    const hotLeads = allLeads.filter(l => l.qualificacao === "quente").length;
    if (hotLeads > 0) {
      insights.push({
        type: "opportunity",
        title: `${hotLeads} lead(s) quente(s) para converter`,
        description: "Leads quentes têm alta probabilidade de conversão. Crie oportunidades para eles.",
        priority: "media",
      });
    }

    // Pipeline health
    const totalValue = allDeals.reduce((sum, d) => sum + Number(d.valor || 0), 0);
    if (totalValue > 0) {
      insights.push({
        type: "insight",
        title: `Pipeline total: R$ ${totalValue.toLocaleString("pt-BR")}`,
        description: `${allDeals.length} deals em aberto. Foque nos deals de maior valor para maximizar receita.`,
        priority: "baixa",
      });
    }

    return insights;
  }),
});
