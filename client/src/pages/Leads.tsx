import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LeadModal } from "@/components/LeadModal";

const temperatureColors = {
  quente: "bg-red-900 text-red-200",
  morno: "bg-yellow-900 text-yellow-200",
  frio: "bg-blue-900 text-blue-200",
  qualificado: "bg-green-900 text-green-200",
};

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch leads from tRPC
  const leadsQuery = trpc.crm.leads.list.useQuery({ limit: 100 });
  const leads = leadsQuery.data || [];

  const filteredLeads = leads.filter(
    (lead: any) =>
      lead.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (leadsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-gray-400 mt-1">Gerenciamento de leads e prospectos</p>
        </div>
        <LeadModal onSuccess={() => leadsQuery.refetch()} />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar por título ou descrição..."
            className="pl-10 bg-gray-800 border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-gray-700">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
          <CardDescription>{filteredLeads.length} leads encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhum lead encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Título</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Qualificação</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Origem</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Valor Estimado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead: any) => (
                    <tr key={lead.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{lead.titulo}</p>
                          <p className="text-xs text-gray-400">{lead.descricao}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            temperatureColors[lead.qualificacao as keyof typeof temperatureColors] || "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {lead.qualificacao || "Não qualificado"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{lead.origem || "-"}</td>
                      <td className="py-3 px-4 font-medium">
                        {lead.valor_estimado ? `R$ ${(lead.valor_estimado / 1000).toFixed(0)}K` : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-blue-400 hover:text-blue-300 text-xs font-medium">
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
