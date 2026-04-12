import React, { useMemo } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Target, Building2, UserCheck, ListTodo } from "lucide-react";
import { trpc } from "@/lib/trpc";

const COLORS = ["#ffbf19", "#10b981", "#ef4444", "#8b5cf6", "#f97316"];

export default function Dashboard() {
  // Fetch real data
  const { data: leads = [] } = trpc.crm.leads.list.useQuery({});
  const { data: companies = [] } = trpc.crm.companies.list.useQuery({});
  const { data: deals = [] } = trpc.crm.opportunities.list.useQuery();
  const { data: stages = [] } = trpc.crm.pipelineStages.list.useQuery();
  const { data: tasksList = [] } = trpc.crm.tasks.list.useQuery({});

  // Calculate KPIs from real data
  const kpis = useMemo(() => {
    const openDeals = deals.filter((d: any) => d.status === "aberta");
    const wonDeals = deals.filter((d: any) => d.status === "ganha");
    const lostDeals = deals.filter((d: any) => d.status === "perdida");
    const totalValue = openDeals.reduce((sum: number, d: any) => sum + parseFloat(d.valor || "0"), 0);
    const wonValue = wonDeals.reduce((sum: number, d: any) => sum + parseFloat(d.valor || "0"), 0);
    const conversionRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;
    const pendingTasks = tasksList.filter((t: any) => t.status !== "concluida").length;

    return {
      totalValue,
      wonValue,
      openDeals: openDeals.length,
      conversionRate,
      totalLeads: leads.length,
      totalCompanies: companies.length,
      pendingTasks,
    };
  }, [deals, leads, companies, tasksList]);

  // Pipeline chart data from real stages
  const pipelineData = useMemo(() => {
    return stages.map((stage: any) => {
      const stageDeals = deals.filter((d: any) => d.stage_id === stage.id && d.status === "aberta");
      const stageValue = stageDeals.reduce((sum: number, d: any) => sum + parseFloat(d.valor || "0"), 0);
      return {
        stage: stage.nome,
        deals: stageDeals.length,
        value: stageValue,
      };
    });
  }, [stages, deals]);

  // Deal status distribution
  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    deals.forEach((d: any) => {
      const status = d.status || "aberta";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const labels: Record<string, string> = {
      aberta: "Aberto",
      ganha: "Ganho",
      perdida: "Perdido",
      cancelada: "Cancelado",
    };
    return Object.entries(statusCounts).map(([key, value]) => ({
      name: labels[key] || key,
      value,
    }));
  }, [deals]);

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}K`;
    return `R$ ${value.toLocaleString("pt-BR")}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visao geral de performance e pipeline</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/80 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              Valor Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{kpis.openDeals} deals em aberto</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/80 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Deals em Aberto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.openDeals}</div>
            <p className="text-xs text-muted-foreground mt-1">Ganhos: {formatCurrency(kpis.wonValue)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/80 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Taxa de Conversao
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{deals.length} deals total</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/80 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Leads Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.totalCompanies} contas | {kpis.pendingTasks} tarefas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
            <CardDescription>Distribuicao de deals por estagio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="stage" stroke="#b0b0b0" fontSize={12} />
                <YAxis stroke="#b0b0b0" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#2a2a2a", border: "1px solid #404040", borderRadius: "8px", color: "#fff" }}
                  formatter={(value: any, name: string) => {
                    if (name === "Valor") return [formatCurrency(value), name];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="deals" fill="#ffbf19" name="Quantidade" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Value Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Valor por Estagio</CardTitle>
            <CardDescription>Valor acumulado no pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="stage" stroke="#b0b0b0" fontSize={12} />
                <YAxis stroke="#b0b0b0" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#2a2a2a", border: "1px solid #404040", borderRadius: "8px", color: "#fff" }}
                  formatter={(value: any) => [formatCurrency(value), "Valor"]}
                />
                <Bar dataKey="value" fill="#10b981" name="Valor (R$)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Status Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Status dos Deals</CardTitle>
            <CardDescription>Distribuicao atual</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Nenhum deal cadastrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Resumo Rapido</CardTitle>
            <CardDescription>Metricas do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#333333]/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span>Contas</span>
                </div>
                <span className="text-xl font-bold">{companies.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#333333]/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-green-400" />
                  <span>Leads</span>
                </div>
                <span className="text-xl font-bold">{leads.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#333333]/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span>Deals</span>
                </div>
                <span className="text-xl font-bold">{deals.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#333333]/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ListTodo className="w-5 h-5 text-amber-400" />
                  <span>Tarefas Pendentes</span>
                </div>
                <span className="text-xl font-bold">{kpis.pendingTasks}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
