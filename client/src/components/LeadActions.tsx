import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Edit, Trash2, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LeadActionsProps {
  lead: any;
  onSuccess?: () => void;
}

export function LeadActions({ lead, onSuccess }: LeadActionsProps) {
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [formData, setFormData] = useState({
    titulo: lead.titulo || "",
    descricao: lead.descricao || "",
    origem: lead.origem || "",
    qualificacao: lead.qualificacao || "frio",
    valor_estimado: lead.valor_estimado || "",
  });

  const utils = trpc.useUtils();

  const updateMutation = trpc.crm.leads.update.useMutation({
    onSuccess: () => {
      toast.success("Lead atualizado com sucesso!");
      setOpenEdit(false);
      utils.crm.leads.list.invalidate();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar lead: ${error.message}`);
    },
  });

  const deleteMutation = trpc.crm.leads.delete.useMutation({
    onSuccess: () => {
      toast.success("Lead deletado com sucesso!");
      setOpenDelete(false);
      utils.crm.leads.list.invalidate();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Erro ao deletar lead: ${error.message}`);
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: lead.id,
      ...formData,
      valor_estimado: formData.valor_estimado ? parseInt(formData.valor_estimado) : undefined,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: lead.id });
  };

  return (
    <div className="flex gap-2">
      {/* View */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
            <DialogDescription>{lead.titulo}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Título</label>
              <p className="text-white font-medium">{lead.titulo}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Descrição</label>
              <p className="text-white font-medium">{lead.descricao || "-"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Origem</label>
                <p className="text-white font-medium">{lead.origem || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Qualificação</label>
                <p className="text-white font-medium">{lead.qualificacao || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Valor Estimado</label>
                <p className="text-white font-medium">{lead.valor_estimado ? `R$ ${(lead.valor_estimado / 1000).toFixed(0)}K` : "-"}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
            <Edit className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>Atualize os dados do lead</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Título</label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 resize-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/80">Origem</label>
                <Input
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
            <div>
              <label className="text-sm font-medium text-foreground/80">Valor Estimado</label>
              <Input
                type="number"
                value={formData.valor_estimado}
                onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)} className="border-border">
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                Atualizar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
            <Trash2 className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Deletar Lead</DialogTitle>
            <DialogDescription>Tem certeza que deseja deletar "{lead.titulo}"?</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpenDelete(false)} className="border-border">
              Cancelar
            </Button>
            <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Deletar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
