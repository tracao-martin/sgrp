import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ContatoModal } from "@/components/ContatoModal";

export default function Contatos() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch contacts from tRPC (mock data for now)
  const contacts = [
    { id: 1, nome: "Roberto Silva", email: "roberto@acme.com", telefone: "(11) 98765-4321", cargo: "Diretor de TI" },
    { id: 2, nome: "Fernanda Costa", email: "fernanda@tech.com", telefone: "(11) 99876-5432", cargo: "Gerente" },
  ];
  const contactsQuery = { isLoading: false, data: contacts };

  const filteredContatos = contacts.filter(
    (contato: any) =>
      contato.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contato.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (false) {
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
          <h1 className="text-3xl font-bold">Contatos</h1>
          <p className="text-gray-400 mt-1">Gerenciamento de contatos e relacionamentos</p>
        </div>
        <ContatoModal onSuccess={() => {}} />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar por nome ou email..."
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
          <CardTitle>Lista de Contatos</CardTitle>
          <CardDescription>{filteredContatos.length} contatos encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredContatos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhum contato encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Telefone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Cargo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContatos.map((contato: any) => (
                    <tr key={contato.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <p className="font-medium">{contato.nome}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{contato.email || "-"}</td>
                      <td className="py-3 px-4 text-gray-400">{contato.telefone || "-"}</td>
                      <td className="py-3 px-4 text-gray-400">{contato.cargo || "-"}</td>
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
