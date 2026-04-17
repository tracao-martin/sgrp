import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const UNIDADES = ["Unidade", "Caixa", "Kg", "Litro", "Metro", "Hora"];

const UNIDADE_COLORS: Record<string, string> = {
  Unidade: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Hora:    "bg-green-500/15 text-green-400 border-green-500/30",
  Caixa:   "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Kg:      "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Litro:   "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  Metro:   "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num) ? "R$ 0,00" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

const emptyForm = { nome: "", unidade: "Unidade", precoBase: "", descricao: "" };

export default function ConfigProdutos() {
  const utils = trpc.useUtils();

  const productsQuery = trpc.crm.products.list.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const createProduct = trpc.crm.products.create.useMutation({
    onSuccess: () => {
      utils.crm.products.list.invalidate();
      toast.success("Produto criado!");
      setShowForm(false);
    },
    onError: () => toast.error("Erro ao criar produto"),
  });

  const updateProduct = trpc.crm.products.update.useMutation({
    onSuccess: () => {
      utils.crm.products.list.invalidate();
      toast.success("Produto atualizado!");
      setShowForm(false);
    },
    onError: () => toast.error("Erro ao atualizar produto"),
  });

  const deleteProduct = trpc.crm.products.delete.useMutation({
    onSuccess: () => {
      utils.crm.products.list.invalidate();
      toast.success("Produto excluído");
    },
    onError: () => toast.error("Erro ao excluir produto"),
  });

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const products = productsQuery.data || [];
  const filtered = products.filter((p) =>
    !search || p.nome.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: typeof products[0]) => {
    setForm({
      nome: p.nome,
      unidade: p.unidade || "Unidade",
      precoBase: p.precoBase || "",
      descricao: p.descricao || "",
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    if (!form.precoBase || isNaN(parseFloat(form.precoBase))) { toast.error("Preço base é obrigatório"); return; }

    if (editingId) {
      updateProduct.mutate({
        id: editingId,
        nome: form.nome,
        unidade: form.unidade,
        precoBase: form.precoBase,
        descricao: form.descricao,
      });
    } else {
      createProduct.mutate({
        nome: form.nome,
        unidade: form.unidade,
        precoBase: form.precoBase,
        descricao: form.descricao,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products.length} produto{products.length !== 1 ? "s" : ""} no catálogo
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produtos..."
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card/60">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-28">Unidade</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-36">Preço Base</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descrição</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-20">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {productsQuery.isLoading && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            )}
            {!productsQuery.isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-muted-foreground">
                  {search ? "Nenhum produto encontrado." : "Nenhum produto cadastrado ainda."}
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="bg-card hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium">{p.nome}</td>
                <td className="px-4 py-3">
                  <Badge
                    className={`text-xs border ${UNIDADE_COLORS[p.unidade || ""] || "bg-zinc-800 text-muted-foreground"}`}
                  >
                    {p.unidade || "—"}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-semibold text-yellow-400">
                  {formatCurrency(p.precoBase || "0")}
                </td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">
                  {p.descricao || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-white"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                      onClick={() => deleteProduct.mutate({ id: p.id })}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Consultoria de Marketing"
                className="mt-1 bg-background border-border"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Unidade de Medida</label>
                <select
                  value={form.unidade}
                  onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-md bg-background border border-border text-sm"
                >
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Preço Base (R$) *</label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.precoBase}
                  onChange={(e) => setForm({ ...form, precoBase: e.target.value })}
                  placeholder="0,00"
                  className="mt-1 bg-background border-border"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descrição opcional do produto..."
                className="mt-1 bg-background border-border"
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-border">
              <Button variant="outline" className="border-border" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                disabled={createProduct.isPending || updateProduct.isPending}
              >
                {editingId ? "Salvar Alterações" : "Criar Produto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
