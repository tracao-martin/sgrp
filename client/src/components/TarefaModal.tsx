import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader } from "lucide-react";
import { toast } from "sonner";

interface TarefaModalProps {
  onSuccess?: () => void;
}

export function TarefaModal({ onSuccess }: TarefaModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    prioridade: "media",
    data_vencimento: "",
    status: "pendente",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error("Título da tarefa é obrigatório");
      return;
    }

    // Simular criação de tarefa
    toast.success("Tarefa criada com sucesso!");
    setFormData({
      titulo: "",
      descricao: "",
      prioridade: "media",
      data_vencimento: "",
      status: "pendente",
    });
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
          <DialogDescription>Preencha os dados da tarefa</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1 */}
          <div>
            <label className="text-sm font-medium text-foreground/80">Título da Tarefa *</label>
            <Input
              placeholder="Ex: Ligar para cliente"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="bg-[#333333] border-border mt-1"
            />
          </div>

          {/* Row 2 */}
          <div>
            <label className="text-sm font-medium text-foreground/80">Descrição</label>
            <textarea
              placeholder="Detalhes da tarefa..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 resize-none"
              rows={3}
            />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Prioridade</label>
              <select
                value={formData.prioridade}
                onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Data de Vencimento</label>
              <Input
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1"
              >
                <option value="pendente">Pendente</option>
                <option value="em_progresso">Em Progresso</option>
                <option value="concluida">Concluída</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
            >
              Criar Tarefa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
