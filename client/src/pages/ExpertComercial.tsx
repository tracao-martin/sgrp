import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Lightbulb, TrendingUp, AlertCircle } from "lucide-react";

const insights = [
  {
    id: 1,
    type: "opportunity",
    title: "Oportunidade: Upsell com Acme Corp",
    description: "Roberto Silva (Acme) tem 6 meses de contrato. Ideal para apresentar novo produto.",
    action: "Ver Deal",
    icon: TrendingUp,
  },
  {
    id: 2,
    type: "risk",
    title: "Risco: Inatividade em Tech Solutions",
    description: "Sem atividades há 15 dias. Recomenda-se follow-up para evitar perda.",
    action: "Agendar Follow-up",
    icon: AlertCircle,
  },
  {
    id: 3,
    type: "insight",
    title: "Insight: Padrão de Conversão",
    description: "Leads com 3+ atividades em 7 dias têm 78% de taxa de conversão.",
    action: "Ver Análise",
    icon: Lightbulb,
  },
];

export default function ExpertComercial() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "Olá! Sou o Expert Comercial do SGRP. Posso ajudar com análises de dados, recomendações de ações e insights sobre seu pipeline. O que você gostaria de saber?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", content: input }]);

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Entendi sua pergunta sobre "${input}". Analisando seus dados... [Resposta simulada do Expert Comercial]`,
        },
      ]);
    }, 500);

    setInput("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Expert Comercial</h1>
        <p className="text-gray-400 mt-1">Assistente de IA para análise e recomendações</p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight) => {
          const IconComponent = insight.icon;
          return (
            <Card key={insight.id} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    {insight.title}
                  </CardTitle>
                  <IconComponent className="w-4 h-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-400">{insight.description}</p>
                <Button variant="outline" size="sm" className="w-full border-gray-600">
                  {insight.action}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chat Interface */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Chat com Expert</CardTitle>
          <CardDescription>Faça perguntas sobre seus dados e receba recomendações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Faça uma pergunta ao Expert..."
              className="bg-gray-700 border-gray-600"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Recomendações Automáticas</CardTitle>
          <CardDescription>Baseadas em análise de dados em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-gray-700 rounded-lg border-l-4 border-green-500">
              <p className="font-medium text-sm">✓ Aumentar Follow-up</p>
              <p className="text-xs text-gray-400 mt-1">
                Leads com 2+ contatos têm 45% mais chance de conversão
              </p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg border-l-4 border-yellow-500">
              <p className="font-medium text-sm">⚠ Revisar Probabilidades</p>
              <p className="text-xs text-gray-400 mt-1">
                Alguns deals em "Proposta" têm baixa probabilidade. Considere reclassificar.
              </p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg border-l-4 border-blue-500">
              <p className="font-medium text-sm">→ Próximo Passo Sugerido</p>
              <p className="text-xs text-gray-400 mt-1">
                Para Acme Corp: Agendar reunião de revisão de contrato em 2 semanas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Tempo Médio de Ciclo</p>
              <p className="text-xl font-bold">45 dias</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Taxa de Ganho</p>
              <p className="text-xl font-bold text-green-400">42%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Valor Médio do Deal</p>
              <p className="text-xl font-bold">R$ 38K</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Atividades/Deal</p>
              <p className="text-xl font-bold">7.2</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
