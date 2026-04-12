import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";

const contasData = [
  {
    id: 1,
    name: "Acme Corporation",
    contacts: 3,
    temperature: "Quente",
    type: "Cliente Ativo",
    value: "R$ 45.000",
    source: "LinkedIn",
  },
  {
    id: 2,
    name: "Tech Solutions",
    contacts: 2,
    temperature: "Morno",
    type: "Prospect",
    value: "R$ 32.000",
    source: "Indicação",
  },
  {
    id: 3,
    name: "Global Ventures",
    contacts: 1,
    temperature: "Frio",
    type: "Prospect",
    value: "R$ 18.000",
    source: "Site",
  },
  {
    id: 4,
    name: "Innovation Labs",
    contacts: 4,
    temperature: "Quente",
    type: "Cliente Ativo",
    value: "R$ 68.000",
    source: "WhatsApp",
  },
];

const temperatureColors = {
  Quente: "bg-red-900 text-red-200",
  Morno: "bg-yellow-900 text-yellow-200",
  Frio: "bg-blue-900 text-blue-200",
};

const typeColors = {
  "Cliente Ativo": "bg-green-900 text-green-200",
  "Cliente Inativo": "bg-gray-700 text-gray-300",
  Prospect: "bg-purple-900 text-purple-200",
};

export default function Contas() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContas = contasData.filter((conta) =>
    conta.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Contas</h1>
          <p className="text-gray-400 mt-1">Gerenciamento de contas e empresas</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Contatos</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Temperatura</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Valor Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContas.map((conta) => (
                  <tr key={conta.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <p className="font-medium">{conta.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-700 px-2 py-1 rounded text-xs">{conta.contacts}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          temperatureColors[conta.temperature as keyof typeof temperatureColors]
                        }`}
                      >
                        {conta.temperature}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          typeColors[conta.type as keyof typeof typeColors]
                        }`}
                      >
                        {conta.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{conta.value}</td>
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
        </CardContent>
      </Card>
    </div>
  );
}
