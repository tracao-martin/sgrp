import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, CheckCircle2, Circle, Trash2, AlertTriangle, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const priorityColors: Record<string, string> = {
  critica: "bg-red-900 text-red-200",
  alta: "bg-orange-900 text-orange-200",
  media: "bg-yellow-900 text-yellow-200",
  baixa: "bg-blue-900 text-blue-200",
};

const priorityLabels: Record<string, string> = {
  critica: "Critica",
  alta: "Alta",
  media: "Media",
  baixa: "Baixa",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_progresso: "Em Progresso",
  concluida: "Concluida",
  cancelada: "Cancelada",
};

export default function Tarefas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    titulo: "",
    descricao: "",
    prioridade: "media",
    data_vencimento: "",
  });

  const { data: tasksList = [], isLoading } = trpc.crm.tasks.list.useQuery({});
  const utils = trpc.useUtils();

  const createTask = trpc.crm.tasks.create.useMutation({
    onSuccess: () => {
      utils.crm.tasks.list.invalidate();
      setShowNewTask(false);
      setNewTask({ titulo: "", descricao: "", prioridade: "media", data_vencimento: "" });
      toast.success("Tarefa criada com sucesso!");
    },
    onError: () => toast.error("Erro ao criar tarefa"),
  });

  const updateTask = trpc.crm.tasks.update.useMutation({
    onSuccess: () => {
      utils.crm.tasks.list.invalidate();
      toast.success("Tarefa atualizada!");
    },
  });

  const deleteTask = trpc.crm.tasks.delete.useMutation({
    onSuccess: () => {
      utils.crm.tasks.list.invalidate();
      toast.success("Tarefa removida!");
    },
  });

  const filteredTasks = tasksList.filter((task: any) => {
    const matchesSearch =
      task.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    if (filter === "pending") return matchesSearch && task.status !== "concluida";
    if (filter === "completed") return matchesSearch && task.status === "concluida";
    return matchesSearch;
  });

  const handleCreateTask = () => {
    if (!newTask.titulo || !newTask.data_vencimento) {
      toast.error("Preencha titulo e data de vencimento");
      return;
    }
    createTask.mutate({
      titulo: newTask.titulo,
      descricao: newTask.descricao || undefined,
      prioridade: newTask.prioridade as any,
      data_vencimento: newTask.data_vencimento,
    });
  };

  const toggleComplete = (task: any) => {
    const newStatus = task.status === "concluida" ? "pendente" : "concluida";
    updateTask.mutate({ id: task.id, status: newStatus });
  };

  const formatDate = (date: any) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const isOverdue = (date: any) => {
    if (!date) return false;
    return new Date(date) < new Date() ;
  };

  const pendingCount = tasksList.filter((t: any) => t.status !== "concluida").length;
  const completedCount = tasksList.filter((t: any) => t.status === "concluida").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <p className="text-gray-400 mt-1">Gerenciamento de tarefas e ações</p>
        </div>
        <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Titulo *</Label>
                <Input
                  value={newTask.titulo}
                  onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })}
                  placeholder="Ex: Preparar proposta comercial"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <Label>Descricao</Label>
                <Textarea
                  value={newTask.descricao}
                  onChange={(e) => setNewTask({ ...newTask, descricao: e.target.value })}
                  placeholder="Detalhes da tarefa..."
                  className="bg-gray-700 border-gray-600"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridade</Label>
                  <Select value={newTask.prioridade} onValueChange={(v) => setNewTask({ ...newTask, prioridade: v })}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Critica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data Vencimento *</Label>
                  <Input
                    type="date"
                    value={newTask.data_vencimento}
                    onChange={(e) => setNewTask({ ...newTask, data_vencimento: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>
              <Button onClick={handleCreateTask} className="w-full bg-blue-600 hover:bg-blue-700" disabled={createTask.isPending}>
                {createTask.isPending ? "Criando..." : "Criar Tarefa"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
            Todas ({tasksList.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            className={filter === "pending" ? "bg-blue-600" : "border-gray-700"}
            onClick={() => setFilter("pending")}
          >
            Pendentes ({pendingCount})
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            className={filter === "completed" ? "bg-blue-600" : "border-gray-700"}
            onClick={() => setFilter("completed")}
          >
            Concluidas ({completedCount})
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center text-gray-400">
              <p>Nenhuma tarefa encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task: any) => (
            <Card
              key={task.id}
              className={`bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors ${
                task.status === "concluida" ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    className="mt-1 text-gray-400 hover:text-blue-400 transition-colors"
                    onClick={() => toggleComplete(task)}
                  >
                    {task.status === "concluida" ? (
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
                            task.status === "concluida" ? "line-through text-gray-500" : "text-white"
                          }`}
                        >
                          {task.titulo}
                        </h3>
                        {task.descricao && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-1">{task.descricao}</p>
                        )}
                      </div>

                      {/* Right Side */}
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-right">
                          {isOverdue(task.data_vencimento) && task.status !== "concluida" && (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className={`text-xs ${isOverdue(task.data_vencimento) && task.status !== "concluida" ? "text-red-400" : "text-gray-400"}`}>
                            {formatDate(task.data_vencimento)}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                            priorityColors[task.prioridade] || "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {priorityLabels[task.prioridade] || task.prioridade}
                        </span>
                        <button
                          onClick={() => deleteTask.mutate({ id: task.id })}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Total de Tarefas</p>
              <p className="text-2xl font-bold">{tasksList.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Concluidas</p>
              <p className="text-2xl font-bold text-green-400">{completedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
