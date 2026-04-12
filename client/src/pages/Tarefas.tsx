import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, CheckCircle2, Circle } from "lucide-react";

const tarefasData = [
  {
    id: 1,
    title: "Preparar proposta",
    related: "Acme Corp",
    assignee: "João Silva",
    dueDate: "15/04/2026",
    priority: "Alta",
    completed: false,
  },
  {
    id: 2,
    title: "Follow-up call",
    related: "Tech Solutions",
    assignee: "Maria Santos",
    dueDate: "12/04/2026",
    priority: "Média",
    completed: false,
  },
  {
    id: 3,
    title: "Enviar contrato",
    related: "Innovation Labs",
    assignee: "Carlos Costa",
    dueDate: "10/04/2026",
    priority: "Baixa",
    completed: true,
  },
  {
    id: 4,
    title: "Análise de concorrência",
    related: "Global Ventures",
    assignee: "Ana Oliveira",
    dueDate: "18/04/2026",
    priority: "Alta",
    completed: false,
  },
];

const priorityColors = {
  Alta: "bg-red-900 text-red-200",
  Média: "bg-yellow-900 text-yellow-200",
  Baixa: "bg-blue-900 text-blue-200",
};

export default function Tarefas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const filteredTarefas = tarefasData.filter((tarefa) => {
    const matchesSearch =
      tarefa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tarefa.related.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "pending") return matchesSearch && !tarefa.completed;
    if (filter === "completed") return matchesSearch && tarefa.completed;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <p className="text-gray-400 mt-1">Gerenciamento de tarefas e ações</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar tarefas..."
            className="pl-10 bg-gray-800 border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            className={filter === "all" ? "bg-blue-600" : "border-gray-700"}
            onClick={() => setFilter("all")}
          >
            Todas
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            className={filter === "pending" ? "bg-blue-600" : "border-gray-700"}
            onClick={() => setFilter("pending")}
          >
            Pendentes
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            className={filter === "completed" ? "bg-blue-600" : "border-gray-700"}
            onClick={() => setFilter("completed")}
          >
            Concluídas
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTarefas.map((tarefa) => (
          <Card
            key={tarefa.id}
            className={`bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors ${
              tarefa.completed ? "opacity-60" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button className="mt-1 text-gray-400 hover:text-blue-400 transition-colors">
                  {tarefa.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3
                        className={`font-medium ${
                          tarefa.completed ? "line-through text-gray-500" : "text-white"
                        }`}
                      >
                        {tarefa.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Relacionado a: <span className="font-medium">{tarefa.related}</span>
                      </p>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="text-right">
                        <p className="text-gray-400">{tarefa.assignee}</p>
                        <p className="text-xs text-gray-500">{tarefa.dueDate}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          priorityColors[tarefa.priority as keyof typeof priorityColors]
                        }`}
                      >
                        {tarefa.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Total de Tarefas</p>
              <p className="text-2xl font-bold">{tarefasData.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-400">
                {tarefasData.filter((t) => !t.completed).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Concluídas</p>
              <p className="text-2xl font-bold text-green-400">
                {tarefasData.filter((t) => t.completed).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
