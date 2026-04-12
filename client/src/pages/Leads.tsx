import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";

const leadsData = [
  {
    id: 1,
    name: "Roberto Silva",
    company: "Acme Corporation",
    email: "roberto@acme.com",
    phone: "(11) 98765-4321",
    temperature: "Quente",
    source: "LinkedIn",
    status: "Ativo",
  },
  {
    id: 2,
    name: "Fernanda Costa",
    company: "Tech Solutions",
    email: "fernanda@techsol.com",
    phone: "(11) 99876-5432",
    temperature: "Morno",
    source: "Indicação",
    status: "Ativo",
  },
  {
    id: 3,
    name: "Lucas Mendes",
    company: "Innovation Labs",
    email: "lucas@innovlab.com",
    phone: "(11) 97654-3210",
    temperature: "Quente",
    source: "Site",
    status: "Ativo",
  },
  {
    id: 4,
    name: "Patricia Gomes",
    company: "Global Ventures",
    email: "patricia@global.com",
    phone: "(11) 96543-2109",
    temperature: "Frio",
    source: "WhatsApp",
    status: "Prospeccão",
  },
];

const temperatureColors = {
  Quente: "bg-red-900 text-red-200",
  Morno: "bg-yellow-900 text-yellow-200",
  Frio: "bg-blue-900 text-blue-200",
};

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLeads = leadsData.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-gray-400 mt-1">Gerenciamento de leads e prospectos</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar por nome, empresa ou email..."
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Temperatura</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Origem</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-xs text-gray-400">{lead.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{lead.company}</td>
                    <td className="py-3 px-4 text-gray-400">{lead.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          temperatureColors[lead.temperature as keyof typeof temperatureColors]
                        }`}
                      >
                        {lead.temperature}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{lead.source}</td>
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
