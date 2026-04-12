import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ContaModalProps {
  onSuccess?: () => void;
}

export function ContaModal({ onSuccess }: ContaModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    website: "",
    endereco: "",
    cidade: "",
    estado: "",
    pais: "",
    segmento: "",
    tamanho: "pequena",
    receita_anual: "",
    status: "prospect",
  });

  const createMutation = trpc.crm.companies.create.useMutation({
    onSuccess: () => {
      toast.success("Conta criada com sucesso!");
      setFormData({
        nome: "",
        cnpj: "",
        email: "",
        telefone: "",
        website: "",
        endereco: "",
        cidade: "",
        estado: "",
        pais: "",
        segmento: "",
        tamanho: "pequena",
        receita_anual: "",
        status: "prospect",
      });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar conta: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error("Nome da empresa é obrigatório");
      return;
    }

    createMutation.mutate({
      ...formData,
      receita_anual: formData.receita_anual ? parseInt(formData.receita_anual) : undefined,
    } as any);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Conta</DialogTitle>
          <DialogDescription>Preencha os dados da empresa</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Nome da Empresa *</label>
              <Input
                placeholder="Ex: Acme Corporation"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">CNPJ</label>
              <Input
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Email</label>
              <Input
                type="email"
                placeholder="contato@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Telefone</label>
              <Input
                placeholder="(11) 98765-4321"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Website</label>
              <Input
                placeholder="https://empresa.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Segmento</label>
              <Input
                placeholder="Ex: Tecnologia"
                value={formData.segmento}
                onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Cidade</label>
              <Input
                placeholder="São Paulo"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Estado</label>
              <Input
                placeholder="SP"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">País</label>
              <Input
                placeholder="Brasil"
                value={formData.pais}
                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Tamanho</label>
              <select
                value={formData.tamanho}
                onChange={(e) => setFormData({ ...formData, tamanho: e.target.value })}
                className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1"
              >
                <option value="micro">Micro</option>
                <option value="pequena">Pequena</option>
                <option value="media">Média</option>
                <option value="grande">Grande</option>
                <option value="multinacional">Multinacional</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Receita Anual</label>
              <Input
                type="number"
                placeholder="1000000"
                value={formData.receita_anual}
                onChange={(e) => setFormData({ ...formData, receita_anual: e.target.value })}
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
                <option value="prospect">Prospect</option>
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
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
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
