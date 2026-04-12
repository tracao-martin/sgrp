import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader, Settings, Layers, Target, Users, Mail, Bell } from "lucide-react";

export default function Configuracoes() {
  const stagesQuery = trpc.crm.pipelineStages.list.useQuery();
  const stages = stagesQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-gray-400 mt-1">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Stages */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <CardTitle>Estágios do Pipeline</CardTitle>
            </div>
            <CardDescription>Configure os estágios do funil de vendas</CardDescription>
          </CardHeader>
          <CardContent>
            {stagesQuery.isLoading ? (
              <div className="flex justify-center py-4">
                <Loader className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : (
              <div className="space-y-2">
                {stages.map((stage: any, idx: number) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-medium">{stage.nome}</span>
                    </div>
                    <span className="text-sm text-gray-400">Ordem: {stage.ordem}</span>
                  </div>
                ))}
                {stages.length === 0 && (
                  <p className="text-center text-gray-400 py-4">Nenhum estágio configurado</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Probabilidades */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              <CardTitle>Probabilidades por Estágio</CardTitle>
            </div>
            <CardDescription>Probabilidade automática de fechamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { stage: "Prospecção", prob: 10 },
                { stage: "Qualificação", prob: 25 },
                { stage: "Proposta", prob: 50 },
                { stage: "Negociação", prob: 75 },
                { stage: "Fechamento", prob: 90 },
              ].map((item) => (
                <div key={item.stage} className="flex items-center gap-3">
                  <div className="w-28 text-sm">{item.stage}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${item.prob}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-right font-medium">{item.prob}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Perfis de Acesso */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <CardTitle>Perfis de Acesso</CardTitle>
            </div>
            <CardDescription>Permissões por tipo de usuário</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { role: "Administrador", permissions: "Acesso total ao sistema", color: "text-red-400" },
                { role: "Gerente", permissions: "Gerenciar equipe, relatórios, configurações", color: "text-yellow-400" },
                { role: "Vendedor", permissions: "Gerenciar leads, deals, atividades", color: "text-blue-400" },
                { role: "Viewer", permissions: "Apenas visualização", color: "text-gray-400" },
              ].map((item) => (
                <div key={item.role} className="p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${item.color}`}>{item.role}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.permissions}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>Configurações de alertas e notificações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Tarefa vencida", desc: "Notificar quando uma tarefa passar da data", active: true },
                { label: "Novo lead", desc: "Notificar quando um novo lead for criado", active: true },
                { label: "Deal movido", desc: "Notificar quando um deal mudar de estágio", active: false },
                { label: "Meta atingida", desc: "Notificar quando a meta mensal for atingida", active: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full ${item.active ? "bg-blue-600" : "bg-gray-600"} relative cursor-pointer`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${item.active ? "left-5" : "left-0.5"}`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integrações */}
        <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              <CardTitle>Integrações</CardTitle>
            </div>
            <CardDescription>Conecte com ferramentas externas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Google Calendar", desc: "Sincronize reuniões e agendamentos", status: "Em breve", icon: "📅" },
                { name: "Email (SMTP)", desc: "Envie emails automáticos", status: "Em breve", icon: "📧" },
                { name: "WhatsApp API", desc: "Integre com WhatsApp Business", status: "Em breve", icon: "💬" },
                { name: "Webhook", desc: "Receba notificações externas", status: "Em breve", icon: "🔗" },
                { name: "Importação CSV", desc: "Importe leads e contatos", status: "Em breve", icon: "📊" },
                { name: "API REST", desc: "Acesse dados via API", status: "Em breve", icon: "⚡" },
              ].map((item) => (
                <div key={item.name} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-yellow-900/50 text-yellow-300 rounded">
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
