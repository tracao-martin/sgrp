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
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Lead</DialogTitle>
          <DialogDescription>Preencha os dados do lead</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1 */}
          <div>
            <label className="text-sm font-medium text-foreground/80">Título do Lead *</label>
            <Input
              placeholder="Ex: Contato com Acme Corp"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="bg-[#333333] border-border mt-1"
            />
          </div>

          {/* Row 2 */}
          <div>
            <label className="text-sm font-medium text-foreground/80">Descrição</label>
            <textarea
              placeholder="Detalhes do lead..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 resize-none"
              rows={3}
            />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Origem</label>
              <Input
                placeholder="Ex: LinkedIn, Indicação"
                value={formData.origem}
                onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Qualificação</label>
              <select
                value={formData.qualificacao}
                onChange={(e) => setFormData({ ...formData, qualificacao: e.target.value })}
                className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1"
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
            <label className="text-sm font-medium text-foreground/80">Valor Estimado (R$)</label>
            <Input
              type="number"
              placeholder="50000"
              value={formData.valor_estimado}
              onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value })}
              className="bg-[#333333] border-border mt-1"
            />
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
