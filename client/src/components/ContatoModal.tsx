import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ContatoModalProps {
  onSuccess?: () => void;
}

export function ContatoModal({ onSuccess }: ContatoModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
    company_id: 1, // Default company
  });

  const createMutation = trpc.crm.contacts.create.useMutation({
    onSuccess: () => {
      toast.success("Contato criado com sucesso!");
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        cargo: "",
        company_id: 1,
      });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar contato: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error("Nome do contato é obrigatório");
      return;
    }

    createMutation.mutate(formData as any);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Contato
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Contato</DialogTitle>
          <DialogDescription>Preencha os dados do contato</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Nome *</label>
              <Input
                placeholder="Ex: Roberto Silva"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Cargo</label>
              <Input
                placeholder="Ex: Diretor de TI"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
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
                placeholder="roberto@empresa.com"
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
                "Criar Contato"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
