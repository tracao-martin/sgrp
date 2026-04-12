import React, { useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader, TrendingUp, Target, DollarSign, BarChart3 } from "lucide-react";

const STAGE_PROBABILITY: Record<string, number> = {
  "Prospecção": 10,
  "Qualificação": 25,
  "Proposta": 50,
  "Negociação": 75,
  "Fechamento": 90,
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function PrevisaoReceita() {
  const opportunitiesQuery = trpc.crm.opportunities.list.useQuery({});
  const stagesQuery = trpc.crm.pipelineStages.list.useQuery();

  const opportunities = opportunitiesQuery.data || [];
  const stages = stagesQuery.data || [];

  const analysis = useMemo(() => {
    if (!opportunities.length) return null;

    // Build stage map
    const stageMap: Record<number, string> = {};
    stages.forEach((s: any) => { stageMap[s.id] = s.nome; });

    // Calculate weighted pipeline
    let totalPipeline = 0;
    let totalWeighted = 0;
    const byStage: Record<string, { count: number; value: number; weighted: number }> = {};

    opportunities.forEach((opp: any) => {
      const stageName = stageMap[opp.stage_id] || "Desconhecido";
      const value = parseFloat(String(opp.valor || "0")) || 0;
      const prob = STAGE_PROBABILITY[stageName] || 50;
      const weighted = value * (prob / 100);

      totalPipeline += value;
      totalWeighted += weighted;

      if (!byStage[stageName]) byStage[stageName] = { count: 0, value: 0, weighted: 0 };
      byStage[stageName].count++;
      byStage[stageName].value += value;
      byStage[stageName].weighted += weighted;
    });

    // Forecast by month (distribute weighted value over next 6 months)
    const months = ["Abr", "Mai", "Jun", "Jul", "Ago", "Set"];
    const monthlyWeights = [0.3, 0.25, 0.2, 0.12, 0.08, 0.05];
    const forecastData = months.map((month, i) => ({
      month,
      otimista: Math.round(totalWeighted * monthlyWeights[i] * 1.3),
      realista: Math.round(totalWeighted * monthlyWeights[i]),
      pessimista: Math.round(totalWeighted * monthlyWeights[i] * 0.6),
    }));

    // Pie data by stage
    const pieData = Object.entries(byStage).map(([name, data]) => ({
      name,
      value: data.value,
      count: data.count,
    }));

    // Bar data by stage
    const barData = Object.entries(byStage).map(([name, data]) => ({
      name,
      pipeline: data.value,
      ponderado: data.weighted,
    }));

    const avgProbability = totalPipeline > 0
      ? Math.round((totalWeighted / totalPipeline) * 100)
      : 0;

    return {
      totalPipeline,
      totalWeighted,
      avgProbability,
      dealCount: opportunities.length,
      forecastData,
      pieData,
      barData,
    };
  }, [opportunities, stages]);

  if (opportunitiesQuery.isLoading || stagesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-16 text-gray-400">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma oportunidade encontrada para gerar previsão</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Previsão de Receita</h1>
        <p className="text-gray-400 mt-1">Projeção baseada em {analysis.dealCount} deals no pipeline</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {(analysis.totalPipeline / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-400">Pipeline Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {(analysis.totalWeighted / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-400">Receita Ponderada</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-900/30 rounded-lg">
                <Target className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analysis.avgProbability}%</p>
                <p className="text-xs text-gray-400">Prob. Média</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analysis.dealCount}</p>
                <p className="text-xs text-gray-400">Deals Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Projeção de Receita (6 meses)</CardTitle>
            <CardDescription>Cenários: Otimista, Realista e Pessimista</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analysis.forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                  formatter={(value: number) => [`R$ ${(value / 1000).toFixed(1)}K`, ""]}
                />
                <Legend />
                <Line type="monotone" dataKey="otimista" stroke="#10b981" name="Otimista" strokeWidth={2} />
                <Line type="monotone" dataKey="realista" stroke="#3b82f6" name="Realista" strokeWidth={2} />
                <Line type="monotone" dataKey="pessimista" stroke="#ef4444" name="Pessimista" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline by Stage */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Pipeline vs Ponderado por Estágio</CardTitle>
            <CardDescription>Valor total vs valor ponderado pela probabilidade</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                  formatter={(value: number) => [`R$ ${(value / 1000).toFixed(1)}K`, ""]}
                />
                <Legend />
                <Bar dataKey="pipeline" fill="#6b7280" name="Pipeline" />
                <Bar dataKey="ponderado" fill="#3b82f6" name="Ponderado" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Pie + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Distribuição por Estágio</CardTitle>
            <CardDescription>Proporção do pipeline por fase</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysis.pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analysis.pieData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                  formatter={(value: number) => [`R$ ${(value / 1000).toFixed(1)}K`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Premissas */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Premissas da Previsão</CardTitle>
            <CardDescription>Probabilidades por estágio do funil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(STAGE_PROBABILITY).map(([stage, prob]) => (
                <div key={stage} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-gray-300">{stage}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${prob}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-right font-medium">{prob}%</div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium mb-2 text-gray-300">Metodologia</h4>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>- Receita ponderada = Valor x Probabilidade do estágio</li>
                <li>- Cenário otimista: +30% sobre realista</li>
                <li>- Cenário pessimista: -40% sobre realista</li>
                <li>- Distribuição temporal: 30/25/20/12/8/5%</li>
                <li>- Atualizado em tempo real com dados do pipeline</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
