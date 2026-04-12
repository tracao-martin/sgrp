import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ContaModal } from "@/components/ContaModal";
import { ContaActions } from "@/components/ContaActions";

const statusColors = {
  ativa: "bg-green-900 text-green-200",
  inativa: "bg-gray-700 text-gray-300",
  prospect: "bg-purple-900 text-purple-200",
};

export default function Contas() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch companies from tRPC
  const companiesQuery = trpc.crm.companies.list.useQuery({ limit: 100 });
  const companies = companiesQuery.data || [];

  const filteredContas = companies.filter((conta: any) =>
    conta.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (companiesQuery.isLoading) {
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
          <h1 className="text-3xl font-bold">Contas</h1>
          <p className="text-gray-400 mt-1">Gerenciamento de contas e empresas</p>
        </div>
        <ContaModal onSuccess={() => companiesQuery.refetch()} />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar por nome da empresa..."
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
          <CardTitle>Lista de Contas</CardTitle>
          <CardDescription>{filteredContas.length} contas encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredContas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhuma conta encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Empresa</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Telefone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Segmento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContas.map((conta: any) => (
                    <tr key={conta.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <p className="font-medium">{conta.nome}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{conta.email || "-"}</td>
                      <td className="py-3 px-4 text-gray-400">{conta.telefone || "-"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[conta.status as keyof typeof statusColors] || "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {conta.status || "Prospect"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{conta.segmento || "-"}</td>
                      <td className="py-3 px-4">
                        <ContaActions conta={conta} onSuccess={() => companiesQuery.refetch()} />
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
