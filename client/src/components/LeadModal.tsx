import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LeadModalProps {
  onSuccess?: () => void;
}

export function LeadModal({ onSuccess }: LeadModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    origem: "",
    qualificacao: "frio",
    valor_estimado: "",
  });

  const createMutation = trpc.crm.leads.create.useMutation({
    onSuccess: () => {
      toast.success("Lead criado com sucesso!");
      setFormData({
        titulo: "",
        descricao: "",
        origem: "",
        qualificacao: "frio",
        valor_estimado: "",
      });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar lead: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error("Título do lead é obrigatório");
      return;
    }

    createMutation.mutate({
      ...formData,
      valor_estimado: formData.valor_estimado ? parseInt(formData.valor_estimado) : undefined,
    } as any);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Lead</DialogTitle>
          <DialogDescription>Preencha os dados do lead</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1 */}
          <div>
            <label className="text-sm font-medium text-gray-300">Título do Lead *</label>
            <Input
              placeholder="Ex: Contato com Acme Corp"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="bg-gray-700 border-gray-600 mt-1"
            />
          </div>

          {/* Row 2 */}
          <div>
            <label className="text-sm font-medium text-gray-300">Descrição</label>
            <textarea
              placeholder="Detalhes do lead..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300 mt-1 resize-none"
              rows={3}
            />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Origem</label>
              <Input
                placeholder="Ex: LinkedIn, Indicação"
                value={formData.origem}
                onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                className="bg-gray-700 border-gray-600 mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Qualificação</label>
              <select
                value={formData.qualificacao}
                onChange={(e) => setFormData({ ...formData, qualificacao: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300 mt-1"
              >
                <option value="frio">Frio</option>
                <option value="morno">Morno</option>
                <option value="quente">Quente</option>
                <option value="qualificado">Qualificado</option>
              </select>
            </div>
          </div>

          {/* Row 4 */}
          <div>
            <label className="text-sm font-medium text-gray-300">Valor Estimado (R$)</label>
            <Input
              type="number"
              placeholder="50000"
              value={formData.valor_estimado}
              onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value })}
              className="bg-gray-700 border-gray-600 mt-1"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
