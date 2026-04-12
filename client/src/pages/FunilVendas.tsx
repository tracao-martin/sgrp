import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const stages = [
  {
    id: "lead_novo",
    name: "Lead Novo",
    color: "bg-blue-600",
    deals: [
      { id: 1, title: "Acme Corp", value: "R$ 45.000", contact: "Roberto Silva" },
      { id: 2, title: "Tech Solutions", value: "R$ 32.000", contact: "Fernanda Costa" },
    ],
  },
  {
    id: "tentativa_contato",
    name: "Tentativa Contato",
    color: "bg-purple-600",
    deals: [
      { id: 3, title: "Global Ventures", value: "R$ 18.000", contact: "Patricia Gomes" },
    ],
  },
  {
    id: "reuniao_call",
    name: "Reunião/Call",
    color: "bg-cyan-600",
    deals: [
      { id: 4, title: "Innovation Labs", value: "R$ 68.000", contact: "Lucas Mendes" },
    ],
  },
  {
    id: "proposta_enviada",
    name: "Proposta Enviada",
    color: "bg-green-600",
    deals: [
      { id: 5, title: "Novo Cliente", value: "R$ 25.000", contact: "João Silva" },
    ],
  },
  {
    id: "negociacao",
    name: "Negociação",
    color: "bg-orange-600",
    deals: [
      { id: 6, title: "Premium Deal", value: "R$ 95.000", contact: "Maria Santos" },
    ],
  },
];

export default function FunilVendas() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Funil de Vendas</h1>
          <p className="text-gray-400 mt-1">Pipeline Kanban - Arraste os deals entre estágios</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Deal
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-full lg:w-80">
            <div className="space-y-3">
              {/* Stage Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <h3 className="font-semibold text-gray-200">{stage.name}</h3>
                </div>
                <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                  {stage.deals.length}
                </span>
              </div>

              {/* Stage Column */}
              <div className="bg-gray-800 rounded-lg p-3 min-h-96 space-y-3">
                {stage.deals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="bg-gray-700 border-gray-600 cursor-move hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-white">{deal.title}</p>
                          <p className="text-xs text-gray-400">{deal.contact}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                          <span className="font-bold text-green-400">{deal.value}</span>
                          <span className="text-xs bg-gray-600 px-2 py-1 rounded text-gray-300">
                            Aberto
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add Card Button */}
                <button className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-colors text-sm">
                  + Adicionar Deal
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Total de Deals</p>
              <p className="text-2xl font-bold">28</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Valor Total</p>
              <p className="text-2xl font-bold">R$ 283K</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Taxa Conversão</p>
              <p className="text-2xl font-bold">34%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Ganhos (Mês)</p>
              <p className="text-2xl font-bold text-green-400">R$ 95K</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Perdidos (Mês)</p>
              <p className="text-2xl font-bold text-red-400">R$ 12K</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
