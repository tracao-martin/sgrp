import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Edit, Trash2, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ContaActionsProps {
  conta: any;
  onSuccess?: () => void;
}

export function ContaActions({ conta, onSuccess }: ContaActionsProps) {
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [formData, setFormData] = useState({
    nome: conta.nome || "",
    cnpj: conta.cnpj || "",
    email: conta.email || "",
    telefone: conta.telefone || "",
    website: conta.website || "",
    endereco: conta.endereco || "",
    cidade: conta.cidade || "",
    estado: conta.estado || "",
    pais: conta.pais || "",
    segmento: conta.segmento || "",
    tamanho: conta.tamanho || "pequena",
    receita_anual: conta.receita_anual || "",
    status: conta.status || "prospect",
  });

  const utils = trpc.useUtils();

  const updateMutation = trpc.crm.companies.update.useMutation({
    onSuccess: () => {
      toast.success("Conta atualizada com sucesso!");
      setOpenEdit(false);
      utils.crm.companies.list.invalidate();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar conta: ${error.message}`);
    },
  });

  const deleteMutation = trpc.crm.companies.delete.useMutation({
    onSuccess: () => {
      toast.success("Conta deletada com sucesso!");
      setOpenDelete(false);
      utils.crm.companies.list.invalidate();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Erro ao deletar conta: ${error.message}`);
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: conta.id,
      ...formData,
      receita_anual: formData.receita_anual ? parseInt(formData.receita_anual) : undefined,
    } as any);
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: conta.id });
  };

  return (
    <div className="flex gap-2">
      {/* View */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Conta</DialogTitle>
            <DialogDescription>{conta.nome}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400">Empresa</label>
                <p className="text-white font-medium">{conta.nome}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">CNPJ</label>
                <p className="text-white font-medium">{conta.cnpj || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Email</label>
                <p className="text-white font-medium">{conta.email || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Telefone</label>
                <p className="text-white font-medium">{conta.telefone || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Website</label>
                <p className="text-white font-medium">{conta.website || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Segmento</label>
                <p className="text-white font-medium">{conta.segmento || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Cidade</label>
                <p className="text-white font-medium">{conta.cidade || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Estado</label>
                <p className="text-white font-medium">{conta.estado || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Tamanho</label>
                <p className="text-white font-medium">{conta.tamanho || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Status</label>
                <p className="text-white font-medium">{conta.status || "-"}</p>
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
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Conta</DialogTitle>
            <DialogDescription>Atualize os dados da empresa</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Nome</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="bg-gray-700 border-gray-600 mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">CNPJ</label>
                <Input
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="bg-gray-700 border-gray-600 mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-gray-700 border-gray-600 mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Telefone</label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="bg-gray-700 border-gray-600 mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)} className="border-gray-600">
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
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle>Deletar Conta</DialogTitle>
            <DialogDescription>Tem certeza que deseja deletar "{conta.nome}"?</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpenDelete(false)} className="border-gray-600">
              Cancelar
            </Button>
            <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
              Deletar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
