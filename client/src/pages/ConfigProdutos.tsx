import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Plus, Package, Pencil, Trash2, Search, Loader } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const RECORRENCIA_LABELS: Record<string, string> = {
  mensal: "Mensal",
  anual: "Anual",
  unico: "Único",
  sob_demanda: "Sob Demanda",
};

const CATEGORIAS = [
  "Consultoria", "Software", "Implementação", "Treinamento",
  "Suporte", "Licença", "Serviço Recorrente", "Projeto",
];

// ─── Form Dialog ──────────────────────────────────────────────────────────────

type FormState = {
  nome: string;
  descricao: string;
  categoria: string;
  precoBase: string;
  recorrencia: "mensal" | "anual" | "unico" | "sob_demanda";
  unidade: string;
};

const EMPTY_FORM: FormState = {
  nome: "", descricao: "", categoria: "Consultoria",
  precoBase: "", recorrencia: "mensal", unidade: "",
};

function ProdutoDialog({
  open, onClose, initial, onSave, isSaving,
}: {
  open: boolean;
  onClose: () => void;
  initial: FormState | null;
  onSave: (f: FormState) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  React.useEffect(() => {
    setForm(initial ?? EMPTY_FORM);
  }, [initial, open]);

  const handle = () => {
    if (!form.nome.trim()) { toast.error("Nome obrigatório"); return; }
    if (!form.precoBase || parseFloat(form.precoBase) < 0) { toast.error("Preço inválido"); return; }
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-foreground/80">Nome *</label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Consultoria Estratégica" className="mt-1 bg-[#333] border-border" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Descrição</label>
            <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Descreva o produto ou serviço..." className="mt-1 bg-[#333] border-border" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Categoria</label>
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="mt-1 w-full h-10 px-3 rounded-md bg-[#333] border border-border text-sm text-white">
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Recorrência</label>
              <select value={form.recorrencia} onChange={(e) => setForm({ ...form, recorrencia: e.target.value as FormState["recorrencia"] })}
                className="mt-1 w-full h-10 px-3 rounded-md bg-[#333] border border-border text-sm text-white">
                {Object.entries(RECORRENCIA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Preço Base (R$) *</label>
              <Input type="number" min={0} step={0.01} value={form.precoBase}
                onChange={(e) => setForm({ ...form, precoBase: e.target.value })}
                placeholder="0,00" className="mt-1 bg-[#333] border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Unidade</label>
              <Input value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                placeholder="Ex: mês, projeto, hora" className="mt-1 bg-[#333] border-border" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose} className="border-border">Cancelar</Button>
            <Button onClick={handle} disabled={isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
              {initial ? "Salvar" : "Criar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ConfigProdutos() {
  const utils = trpc.useUtils();
  const { data: produtos = [], isLoading } = trpc.crm.products.list.useQuery();

  const createMutation = trpc.crm.products.create.useMutation({
    onSuccess: () => { utils.crm.products.list.invalidate(); toast.success("Produto criado!"); setDialog({ open: false, editing: null }); },
    onError: (e: any) => toast.error(e.message),
  });
  const updateMutation = trpc.crm.products.update.useMutation({
    onSuccess: () => { utils.crm.products.list.invalidate(); toast.success("Produto atualizado!"); setDialog({ open: false, editing: null }); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMutation = trpc.crm.products.delete.useMutation({
    onSuccess: () => { utils.crm.products.list.invalidate(); toast.success("Produto excluído"); },
    onError: (e: any) => toast.error(e.message),
  });

  const [search, setSearch] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"todos" | "ativos" | "inativos">("todos");
  const [dialog, setDialog] = useState<{ open: boolean; editing: any | null }>({ open: false, editing: null });

  const categorias = Array.from(new Set(produtos.map((p: any) => p.categoria).filter(Boolean)));

  const filtered = produtos.filter((p: any) => {
    if (search && !p.nome.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategoria && p.categoria !== filterCategoria) return false;
    if (filterStatus === "ativos" && !p.ativo) return false;
    if (filterStatus === "inativos" && p.ativo) return false;
    return true;
  });

  const totalAtivos = produtos.filter((p: any) => p.ativo).length;
  const mrr = produtos
    .filter((p: any) => p.ativo && p.recorrencia === "mensal")
    .reduce((acc: number, p: any) => acc + parseFloat(p.precoBase || "0"), 0);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const openEdit = (p: any) =>
    setDialog({
      open: true,
      editing: { nome: p.nome, descricao: p.descricao || "", categoria: p.categoria || "Consultoria", precoBase: p.precoBase?.toString() || "0", recorrencia: p.recorrencia, unidade: p.unidade || "", _id: p.id },
    });

  const handleSave = (f: FormState) => {
    if (dialog.editing?._id) {
      updateMutation.mutate({ id: dialog.editing._id, ...f });
    } else {
      createMutation.mutate(f);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-7 h-7 text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold">Produtos e Serviços</h1>
            <p className="text-muted-foreground text-sm">Catálogo de produtos e serviços oferecidos</p>
          </div>
        </div>
        <Button onClick={() => setDialog({ open: true, editing: null })} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{produtos.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{totalAtivos}</p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{categorias.length}</p>
            <p className="text-xs text-muted-foreground">Categorias</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400 text-sm">{formatCurrency(mrr)}</p>
            <p className="text-xs text-muted-foreground">MRR potencial</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar produto..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border" />
        </div>
        <div className="flex gap-1">
          {(["todos", "ativos", "inativos"] as const).map((s) => (
            <Button key={s} variant={filterStatus === s ? "default" : "outline"} size="sm"
              onClick={() => setFilterStatus(s)}
              className={filterStatus === s ? "bg-primary" : "border-border text-foreground/80"}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        {categorias.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            <Button variant={filterCategoria === null ? "default" : "outline"} size="sm"
              onClick={() => setFilterCategoria(null)}
              className={filterCategoria === null ? "bg-primary" : "border-border text-foreground/80"}>
              Todas
            </Button>
            {categorias.map((cat: any) => (
              <Button key={cat} variant={filterCategoria === cat ? "default" : "outline"} size="sm"
                onClick={() => setFilterCategoria(cat)}
                className={filterCategoria === cat ? "bg-primary" : "border-border text-foreground/80"}>
                {cat}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
            {produtos.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">Clique em "Novo Produto" para adicionar</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p: any) => (
            <Card key={p.id} className={`border-border transition-all ${p.ativo ? "bg-card" : "bg-card/50 opacity-70"}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm leading-tight">{p.nome}</h3>
                    {p.categoria && (
                      <Badge className="mt-1 text-xs bg-primary/20 text-primary">{p.categoria}</Badge>
                    )}
                  </div>
                  <Switch checked={p.ativo} onCheckedChange={() => updateMutation.mutate({ id: p.id, ativo: !p.ativo })} />
                </div>

                {p.descricao && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.descricao}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <p className="text-lg font-bold text-yellow-400">
                      {formatCurrency(parseFloat(p.precoBase || "0"))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {RECORRENCIA_LABELS[p.recorrencia]}{p.unidade ? ` · ${p.unidade}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}
                      className="text-primary hover:text-primary h-8 w-8 p-0">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: p.id })}
                      className="text-red-400 hover:text-red-300 h-8 w-8 p-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProdutoDialog
        open={dialog.open}
        initial={dialog.editing}
        onClose={() => setDialog({ open: false, editing: null })}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
