import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Plus,
  Package,
  Pencil,
  Trash2,
  Search,
  DollarSign,
  Tag,
  RefreshCw,
  Archive,
  MoreVertical,
} from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  precoBase: number;
  recorrencia: "mensal" | "anual" | "unico" | "sob_demanda";
  ativo: boolean;
  moeda: string;
  unidade: string;
  createdAt: string;
}

const CATEGORIAS = [
  "Consultoria",
  "Software",
  "Implementação",
  "Treinamento",
  "Suporte",
  "Licença",
  "Serviço Recorrente",
  "Projeto",
];

const CATEGORIA_CORES: Record<string, string> = {
  Consultoria: "bg-purple-900/30 text-purple-300",
  Software: "bg-primary/20 text-primary",
  "Implementação": "bg-green-900/30 text-green-300",
  Treinamento: "bg-yellow-900/30 text-yellow-300",
  Suporte: "bg-orange-900/30 text-orange-300",
  "Licença": "bg-cyan-900/30 text-cyan-300",
  "Serviço Recorrente": "bg-pink-900/30 text-pink-300",
  Projeto: "bg-indigo-900/30 text-indigo-300",
};

const RECORRENCIA_LABELS: Record<string, string> = {
  mensal: "Mensal",
  anual: "Anual",
  unico: "Único",
  sob_demanda: "Sob Demanda",
};

const INITIAL_PRODUTOS: Produto[] = [
  {
    id: "1", nome: "Consultoria Estratégica Comercial", descricao: "Diagnóstico e reestruturação do processo comercial com foco em previsibilidade de receita. Inclui análise do pipeline, definição de ICP, e desenho do playbook de vendas.",
    categoria: "Consultoria", precoBase: 15000, recorrencia: "unico", ativo: true, moeda: "BRL", unidade: "projeto", createdAt: "2025-01-15",
  },
  {
    id: "2", nome: "SOaaS - Sales Operations as a Service", descricao: "Operação contínua de Sales Ops com gestão de pipeline, forecast semanal, coaching de vendedores e rituais de governança comercial.",
    categoria: "Serviço Recorrente", precoBase: 8500, recorrencia: "mensal", ativo: true, moeda: "BRL", unidade: "mês", createdAt: "2025-02-01",
  },
  {
    id: "3", nome: "Licença SGRP - Plano Core", descricao: "Acesso ao sistema GRP com pipeline, atividades, playbooks e dashboards básicos. Até 5 usuários.",
    categoria: "Licença", precoBase: 497, recorrencia: "mensal", ativo: true, moeda: "BRL", unidade: "mês", createdAt: "2025-03-01",
  },
  {
    id: "4", nome: "Licença SGRP - Plano Growth", descricao: "Inclui forecast avançado, performance, expansão, rituais e integrações adicionais. Até 15 usuários.",
    categoria: "Licença", precoBase: 1297, recorrencia: "mensal", ativo: true, moeda: "BRL", unidade: "mês", createdAt: "2025-03-01",
  },
  {
    id: "5", nome: "Implementação e Onboarding", descricao: "Setup completo do sistema: configuração de funis, ICPs, cadências, importação de dados e treinamento da equipe.",
    categoria: "Implementação", precoBase: 5000, recorrencia: "unico", ativo: true, moeda: "BRL", unidade: "projeto", createdAt: "2025-01-20",
  },
  {
    id: "6", nome: "Treinamento SPIN Selling", descricao: "Workshop presencial ou remoto de 8h sobre metodologia SPIN aplicada a vendas consultivas B2B.",
    categoria: "Treinamento", precoBase: 3500, recorrencia: "unico", ativo: true, moeda: "BRL", unidade: "turma", createdAt: "2025-04-01",
  },
  {
    id: "7", nome: "Suporte Premium", descricao: "Suporte prioritário com SLA de 4h, canal dedicado no Slack e reunião mensal de acompanhamento.",
    categoria: "Suporte", precoBase: 1500, recorrencia: "mensal", ativo: false, moeda: "BRL", unidade: "mês", createdAt: "2025-05-01",
  },
];

export default function ConfigProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>(INITIAL_PRODUTOS);
  const [search, setSearch] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"todos" | "ativos" | "inativos">("todos");
  const [showForm, setShowForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    categoria: "Consultoria",
    precoBase: "",
    recorrencia: "mensal" as Produto["recorrencia"],
    unidade: "",
  });

  const filteredProdutos = produtos.filter((p) => {
    if (search && !p.nome.toLowerCase().includes(search.toLowerCase()) && !p.descricao.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategoria && p.categoria !== filterCategoria) return false;
    if (filterStatus === "ativos" && !p.ativo) return false;
    if (filterStatus === "inativos" && p.ativo) return false;
    return true;
  });

  const totalAtivos = produtos.filter((p) => p.ativo).length;
  const categorias = Array.from(new Set(produtos.map((p) => p.categoria)));
  const receitaMensalPotencial = produtos
    .filter((p) => p.ativo && p.recorrencia === "mensal")
    .reduce((acc, p) => acc + p.precoBase, 0);

  const openForm = (produto?: Produto) => {
    if (produto) {
      setForm({
        nome: produto.nome,
        descricao: produto.descricao,
        categoria: produto.categoria,
        precoBase: produto.precoBase.toString(),
        recorrencia: produto.recorrencia,
        unidade: produto.unidade,
      });
      setEditingProduto(produto);
    } else {
      setForm({ nome: "", descricao: "", categoria: "Consultoria", precoBase: "", recorrencia: "mensal", unidade: "" });
      setEditingProduto(null);
    }
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.nome.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }
    if (!form.precoBase || parseFloat(form.precoBase) < 0) {
      toast.error("Preço base é obrigatório");
      return;
    }

    if (editingProduto) {
      setProdutos(
        produtos.map((p) =>
          p.id === editingProduto.id
            ? { ...p, nome: form.nome, descricao: form.descricao, categoria: form.categoria, precoBase: parseFloat(form.precoBase), recorrencia: form.recorrencia, unidade: form.unidade }
            : p
        )
      );
      toast.success("Produto atualizado!");
    } else {
      setProdutos([
        ...produtos,
        {
          id: Date.now().toString(),
          nome: form.nome,
          descricao: form.descricao,
          categoria: form.categoria,
          precoBase: parseFloat(form.precoBase),
          recorrencia: form.recorrencia,
          ativo: true,
          moeda: "BRL",
          unidade: form.unidade || "unidade",
          createdAt: new Date().toISOString().split("T")[0],
        },
      ]);
      toast.success("Produto criado!");
    }
    setShowForm(false);
  };

  const handleToggle = (id: string) => {
    setProdutos(produtos.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p)));
  };

  const handleDelete = (id: string) => {
    setProdutos(produtos.filter((p) => p.id !== id));
    toast.success("Produto excluído");
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Package className="w-7 h-7 text-orange-400" />
            <h1 className="text-2xl font-bold">Produtos e Serviços</h1>
          </div>
          <p className="text-muted-foreground mt-1 ml-10">
            Gerencie o catálogo de produtos e serviços oferecidos
          </p>
        </div>
        <Button onClick={() => openForm()} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{produtos.length}</p>
            <p className="text-xs text-muted-foreground">Total de produtos</p>
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
            <p className="text-2xl font-bold text-yellow-400">{formatCurrency(receitaMensalPotencial)}</p>
            <p className="text-xs text-muted-foreground">MRR potencial</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-1">
          {(["todos", "ativos", "inativos"] as const).map((s) => (
            <Button
              key={s}
              variant={filterStatus === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(s)}
              className={filterStatus === s ? "bg-primary" : "border-border text-foreground/80"}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button
            variant={filterCategoria === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategoria(null)}
            className={filterCategoria === null ? "bg-primary" : "border-border text-foreground/80"}
          >
            Todas
          </Button>
          {categorias.map((cat) => (
            <Button
              key={cat}
              variant={filterCategoria === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategoria(cat)}
              className={filterCategoria === cat ? "bg-primary" : "border-border text-foreground/80"}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProdutos.map((produto) => (
          <Card
            key={produto.id}
            className={`border-border transition-all ${
              produto.ativo ? "bg-card" : "bg-card/50 opacity-70"
            }`}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm leading-tight">{produto.nome}</h3>
                  <Badge className={`mt-1 text-xs ${CATEGORIA_CORES[produto.categoria] || "bg-[#333333] text-foreground/80"}`}>
                    {produto.categoria}
                  </Badge>
                </div>
                <Switch
                  checked={produto.ativo}
                  onCheckedChange={() => handleToggle(produto.id)}
                />
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{produto.descricao}</p>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-lg font-bold text-yellow-400">{formatCurrency(produto.precoBase)}</p>
                  <div className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {RECORRENCIA_LABELS[produto.recorrencia]} · {produto.unidade}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openForm(produto)}
                    className="text-primary hover:text-primary h-8 w-8 p-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(produto.id)}
                    className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProdutos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum produto encontrado</p>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduto ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground/80">Nome *</label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Consultoria Estratégica Comercial"
                className="mt-1 bg-[#333333] border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Descrição</label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descreva o produto ou serviço..."
                className="mt-1 bg-[#333333] border-border"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/80">Categoria</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-md bg-[#333333] border border-border text-sm text-white"
                >
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80">Recorrência</label>
                <select
                  value={form.recorrencia}
                  onChange={(e) => setForm({ ...form, recorrencia: e.target.value as Produto["recorrencia"] })}
                  className="mt-1 w-full h-10 px-3 rounded-md bg-[#333333] border border-border text-sm text-white"
                >
                  {Object.entries(RECORRENCIA_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/80">Preço Base (R$) *</label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.precoBase}
                  onChange={(e) => setForm({ ...form, precoBase: e.target.value })}
                  placeholder="0,00"
                  className="mt-1 bg-[#333333] border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80">Unidade</label>
                <Input
                  value={form.unidade}
                  onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                  placeholder="Ex: mês, projeto, turma, hora"
                  className="mt-1 bg-[#333333] border-border"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-border">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                {editingProduto ? "Salvar Alterações" : "Criar Produto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
