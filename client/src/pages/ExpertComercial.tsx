import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Lightbulb, TrendingUp, AlertCircle, AlertTriangle, Bot, User, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const insightIcons: Record<string, React.ElementType> = {
  opportunity: TrendingUp,
  risk: AlertCircle,
  warning: AlertTriangle,
  insight: Lightbulb,
};

const insightColors: Record<string, string> = {
  opportunity: "border-green-500",
  risk: "border-red-500",
  warning: "border-yellow-500",
  insight: "border-primary",
};

const priorityBadge: Record<string, string> = {
  alta: "bg-red-500/20 text-red-400",
  media: "bg-yellow-500/20 text-yellow-400",
  baixa: "bg-primary/20 text-primary",
};

export default function ExpertComercial() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Olá! Sou o Expert Comercial do SGRP. Posso ajudar com análises de dados do pipeline, recomendações de ações e insights sobre suas vendas. O que você gostaria de saber?",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch real insights from backend
  const { data: insights = [], isLoading: loadingInsights } = trpc.expert.getInsights.useQuery();

  // Fetch pipeline KPIs for metrics
  const { data: deals = [] } = trpc.crm.opportunities.list.useQuery();
  const { data: tasksList = [] } = trpc.crm.tasks.list.useQuery();

  // Chat mutation
  const chatMutation = trpc.expert.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Desculpe, houve um erro ao processar sua pergunta. Tente novamente." },
      ]);
    },
  });

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Compute real metrics
  const metrics = React.useMemo(() => {
    const wonDeals = deals.filter((d: any) => d.status === "ganha");
    const lostDeals = deals.filter((d: any) => d.status === "perdida");
    const totalClosed = wonDeals.length + lostDeals.length;
    const winRate = totalClosed > 0 ? Math.round((wonDeals.length / totalClosed) * 100) : 0;
    const avgDealValue = deals.length > 0
      ? deals.reduce((sum: number, d: any) => sum + Number(d.valor || 0), 0) / deals.length
      : 0;
    const overdueTasks = tasksList.filter((t: any) => {
      if (!t.data_vencimento) return false;
      return new Date(t.data_vencimento) < new Date() && t.status !== "concluida";
    }).length;
    const pendingTasks = tasksList.filter((t: any) => t.status !== "concluida").length;

    return { winRate, avgDealValue, overdueTasks, pendingTasks, totalDeals: deals.length };
  }, [deals, tasksList]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");

    // Send to backend with history (last 10 messages for context)
    const history = messages.slice(-10).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    chatMutation.mutate({ message: userMessage, history });
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}K`;
    return `R$ ${value.toLocaleString("pt-BR")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Expert Comercial</h1>
        <p className="text-muted-foreground mt-1">Assistente inteligente para análise e recomendações de vendas</p>
      </div>

      {/* Real Insights Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Insights do Pipeline</h2>
        {loadingInsights ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analisando dados...
          </div>
        ) : insights.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum insight disponível. Adicione mais dados ao pipeline.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight: any, idx: number) => {
              const IconComponent = insightIcons[insight.type] || Lightbulb;
              const borderColor = insightColors[insight.type] || "border-gray-500";
              const badge = priorityBadge[insight.priority] || "bg-gray-500/20 text-muted-foreground";
              return (
                <Card key={idx} className={`bg-card border-border border-l-4 ${borderColor}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium text-gray-200">
                        {insight.title}
                      </CardTitle>
                      <IconComponent className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${badge}`}>
                      Prioridade {insight.priority}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Chat com Expert
          </CardTitle>
          <CardDescription>Faça perguntas sobre seus dados e receba recomendações baseadas no pipeline real</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <div className="bg-[#1c1c1c] rounded-lg p-4 h-96 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-lg px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-[#333333] text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#444444] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#333333] px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analisando...
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Qual o valor total do pipeline? Quais deals estão parados?"
              className="bg-[#333333] border-border"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={chatMutation.isPending}
            />
            <Button
              onClick={handleSend}
              className="bg-primary hover:bg-primary/90"
              disabled={chatMutation.isPending || !input.trim()}
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real Performance Metrics */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
          <CardDescription>Dados calculados em tempo real a partir do pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total de Deals</p>
              <p className="text-xl font-bold">{metrics.totalDeals}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Taxa de Ganho</p>
              <p className="text-xl font-bold text-green-400">{metrics.winRate}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Valor Médio do Deal</p>
              <p className="text-xl font-bold">{formatCurrency(metrics.avgDealValue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tarefas Pendentes</p>
              <p className="text-xl font-bold text-yellow-400">{metrics.pendingTasks}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tarefas Atrasadas</p>
              <p className="text-xl font-bold text-red-400">{metrics.overdueTasks}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
