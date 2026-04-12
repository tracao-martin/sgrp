import React from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const forecastData = [
  { month: "Abr", atual: 145000, previsto: 165000, pessimista: 120000 },
  { month: "Mai", atual: 0, previsto: 180000, pessimista: 140000 },
  { month: "Jun", atual: 0, previsto: 195000, pessimista: 155000 },
  { month: "Jul", atual: 0, previsto: 210000, pessimista: 170000 },
  { month: "Ago", atual: 0, previsto: 225000, pessimista: 185000 },
  { month: "Set", atual: 0, previsto: 240000, pessimista: 200000 },
];

const sellerForecast = [
  { name: "João Silva", target: 80000, forecast: 92000, probability: 85 },
  { name: "Maria Santos", target: 70000, forecast: 75000, probability: 72 },
  { name: "Carlos Costa", target: 60000, forecast: 58000, probability: 65 },
  { name: "Ana Oliveira", target: 50000, forecast: 48000, probability: 60 },
];

export default function PrevisaoReceita() {
  const totalForecast = forecastData.reduce((sum, m) => sum + m.previsto, 0);
  const totalTarget = 1_000_000;
  const forecastPercentage = ((totalForecast / totalTarget) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Previsão de Receita</h1>
        <p className="text-gray-400 mt-1">Projeção de receita baseada em deals abertos</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">Previsão Total (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(totalForecast / 1000).toFixed(0)}K</div>
            <p className="text-xs text-green-400 mt-1">↑ {forecastPercentage}% da meta</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">Meta Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1.000K</div>
            <p className="text-xs text-gray-400 mt-1">Até dezembro</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">Probabilidade Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-gray-400 mt-1">Deals em aberto</p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Projeção de Receita</CardTitle>
          <CardDescription>Cenários: Otimista, Realista e Pessimista</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }} />
              <Legend />
              <Line type="monotone" dataKey="atual" stroke="#10b981" name="Atual" strokeWidth={2} />
              <Line type="monotone" dataKey="previsto" stroke="#3b82f6" name="Previsto" strokeWidth={2} />
              <Line type="monotone" dataKey="pessimista" stroke="#ef4444" name="Pessimista" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Seller Forecast */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Previsão por Vendedor</CardTitle>
          <CardDescription>Performance esperada vs meta</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sellerForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }} />
              <Legend />
              <Bar dataKey="target" fill="#6b7280" name="Meta" />
              <Bar dataKey="forecast" fill="#3b82f6" name="Previsão" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Seller Details */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Detalhes por Vendedor</CardTitle>
          <CardDescription>Análise detalhada de performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sellerForecast.map((seller, idx) => (
              <div key={idx} className="p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium">{seller.name}</p>
                    <p className="text-sm text-gray-400">Meta: R$ {(seller.target / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-400">R$ {(seller.forecast / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-gray-400">
                      {((seller.forecast / seller.target) * 100).toFixed(0)}% da meta
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Probabilidade Média</span>
                    <span className="font-medium">{seller.probability}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${seller.probability}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assumptions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Premissas da Previsão</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>✓ Baseada em deals com probabilidade &gt; 50%</li>
            <li>✓ Considera histórico de conversão dos últimos 3 meses</li>
            <li>✓ Inclui sazonalidade e tendências de mercado</li>
            <li>✓ Atualizada diariamente com novos deals</li>
            <li>✓ Cenário pessimista: -25% da previsão realista</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
