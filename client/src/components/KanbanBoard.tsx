/**
 * Kanban Board - Pipeline visualization with drag-and-drop
 * Displays opportunities by stage
 */

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";

interface KanbanStage {
  id: string;
  label: string;
  color: string;
}

interface Opportunity {
  id: number;
  organizationId: number;
  titulo: string;
  valor?: number | string | null;
  probabilidade?: number | null;
  stage_id?: number | null;
  company_id?: number | null;
  contact_id?: number | null;
  motivo_ganho?: string | null;
  motivo_perda?: string | null;
  status: string | null;
  qualificacao?: string | null;
  origem?: string | null;
  descricao?: string | null;
  responsavel_id?: number | null;
  valor_estimado?: number | string | null;
  data_conversao?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const STAGES: KanbanStage[] = [
  { id: "1", label: "Lead Novo", color: "#3B82F6" },
  { id: "2", label: "Tentativa de Contato", color: "#8B5CF6" },
  { id: "3", label: "Reunião/Call", color: "#EC4899" },
  { id: "4", label: "Proposta Enviada", color: "#F59E0B" },
  { id: "5", label: "Negociação", color: "#10B981" },
];

export function KanbanBoard() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [draggedItem, setDraggedItem] = useState<Opportunity | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Opportunity | null>(null);

  // Fetch opportunities
  const { data: opps } = trpc.crm.leads.list.useQuery({});

  useEffect(() => {
    if (opps) {
      setOpportunities(opps);
    }
  }, [opps]);

  const handleDragStart = (e: React.DragEvent, opp: Opportunity) => {
    setDraggedItem(opp);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedItem) {
      // Update opportunity stage
      setOpportunities((prev) =>
        prev.map((opp) =>
          opp.id === draggedItem.id
            ? { ...opp, stage_id: parseInt(stageId) }
            : opp
        )
      );
      setDraggedItem(null);
    }
  };

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter((opp) => opp.stage_id === parseInt(stageId));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="w-full h-full overflow-x-auto">
      <div className="flex gap-4 p-4 min-w-max">
        {STAGES.map((stage) => {
          const stageOpps = getOpportunitiesByStage(stage.id);
          const totalValue = stageOpps.reduce((sum, opp) => sum + (Number(opp.valor) || Number(opp.valor_estimado) || 0), 0);

          return (
            <div
              key={stage.id}
              className="flex flex-col gap-3 w-80 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Stage Header */}
              <div
                className="p-3 rounded-lg text-white font-semibold"
                style={{ backgroundColor: stage.color }}
              >
                <div className="flex justify-between items-center">
                  <span>{stage.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {stageOpps.length}
                  </Badge>
                </div>
                <div className="text-xs mt-1 opacity-90">
                  {formatCurrency(totalValue)}
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex flex-col gap-2 min-h-96 bg-[#f5f5f5] dark:bg-card rounded-lg p-2">
                {stageOpps.map((opp) => (
                  <Card
                    key={opp.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, opp)}
                    onClick={() => setSelectedDeal(opp)}
                    className="cursor-move hover:shadow-lg transition-shadow p-3 bg-white dark:bg-[#333333]"
                  >
                    <div className="flex gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {opp.titulo}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCurrency(Number(opp.valor ?? opp.valor_estimado ?? 0))}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {opp.probabilidade ?? 0}%
                          </Badge>
                          <Badge
                            variant={
                              opp.status === "ganha"
                                ? "default"
                                : opp.status === "perdida"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {opp.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Add New Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-auto text-muted-foreground hover:text-gray-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Oportunidade
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Detail Modal - Simplified */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-96 overflow-y-auto p-6">
            <h2 className="text-lg font-bold mb-4">{selectedDeal.titulo}</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold">Valor:</span>{" "}
                {formatCurrency(Number(selectedDeal.valor ?? selectedDeal.valor_estimado ?? 0))}
              </div>
              <div>
                <span className="font-semibold">Probabilidade:</span>{" "}
                {selectedDeal.probabilidade ?? 0}%
              </div>
              <div>
                <span className="font-semibold">Status:</span> {selectedDeal.status}
              </div>
              {selectedDeal.motivo_ganho && (
                <div>
                  <span className="font-semibold">Motivo Ganho:</span>{" "}
                  {selectedDeal.motivo_ganho}
                </div>
              )}
            </div>
            <Button
              onClick={() => setSelectedDeal(null)}
              className="w-full mt-4"
            >
              Fechar
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
