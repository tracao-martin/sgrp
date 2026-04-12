import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus,
  Target,
  Pencil,
  Trash2,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Award,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Filter,
} from "lucide-react";

interface Meta {
  id: string;
  periodo: string;
  tipoPeriodo: "mensal" | "trimestral" | "anual";
  responsavel: string;
  tipoResponsavel: "vendedor" | "equipe" | "organizacao";
  tipoMeta: "receita_nova" | "expansao" | "total" | "deals_ganhos" | "leads_qualificados";
  valorMeta: number;
  valorAtual: number;
  ativo: boolean;
}

const TIPO_META_LABELS: Record<string, string> = {
  receita_nova: "Receita Nova",
  expansao: "Expansão",
  total: "Receita Total",
  deals_ganhos: "Deals Ganhos",
  leads_qualificados: "Leads Qualificados",
};

const TIPO_META_CORES: Record<string, string> = {
  receita_nova: "bg-green-900/30 text-green-300",
  expansao: "bg-purple-900/30 text-purple-300",
  total: "bg-blue-900/30 text-blue-300",
  deals_ganhos: "bg-yellow-900/30 text-yellow-300",
  leads_qualificados: "bg-cyan-900/30 text-cyan-300",
};

const TIPO_PERIODO_LABELS: Record<string, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  anual: "Anual",
};

const INITIAL_METAS: Meta[] = [
  { id: "1", periodo: "2026-04", tipoPeriodo: "mensal", responsavel: "Tração Comercial", tipoResponsavel: "organizacao", tipoMeta: "receita_nova", valorMeta: 150000, valorAtual: 87500, ativo: true },
  { id: "2", periodo: "2026-04", tipoPeriodo: "mensal", responsavel: "Tração Comercial", tipoResponsavel: "organizacao", tipoMeta: "deals_ganhos", valorMeta: 8, valorAtual: 3, ativo: true },
  { id: "3", periodo: "2026-04", tipoPeriodo: "mensal", responsavel: "Carlos Mendes", tipoResponsavel: "vendedor", tipoMeta: "receita_nova", valorMeta: 50000, valorAtual: 32000, ativo: true },
  { id: "4", periodo: "2026-04", tipoPeriodo: "mensal", responsavel: "Ana Oliveira", tipoResponsavel: "vendedor", tipoMeta: "receita_nova", valorMeta: 50000, valorAtual: 28500, ativo: true },
  { id: "5", periodo: "2026-04", tipoPeriodo: "mensal", responsavel: "Pedro Santos", tipoResponsavel: "vendedor", tipoMeta: "receita_nova", valorMeta: 50000, valorAtual: 27000, ativo: true },
  { id: "6", periodo: "2026-Q2", tipoPeriodo: "trimestral", responsavel: "Tração Comercial", tipoResponsavel: "organizacao", tipoMeta: "total", valorMeta: 500000, valorAtual: 145000, ativo: true },
  { id: "7", periodo: "2026", tipoPeriodo: "anual", responsavel: "Tração Comercial", tipoResponsavel: "organizacao", tipoMeta: "total", valorMeta: 2000000, valorAtual: 420000, ativo: true },
  { id: "8", periodo: "2026-04", tipoPeriodo: "mensal", responsavel: "Tração Comercial", tipoResponsavel: "organizacao", tipoMeta: "expansao", valorMeta: 30000, valorAtual: 12000, ativo: true },
  { id: "9", periodo: "2026-03", tipoPeriodo: "mensal", responsavel: "Tração Comercial", tipoResponsavel: "organizacao", tipoMeta: "receita_nova", valorMeta: 120000, valorAtual: 135000, ativo: false },
  { id: "10", periodo: "2026-03", tipoPeriodo: "mensal", responsavel: "Carlos Mendes", tipoResponsavel: "vendedor", tipoMeta: "receita_nova", valorMeta: 40000, valorAtual: 48000, ativo: false },
];

export default function ConfigMetas() {
  const [metas, setMetas] = useState<Meta[]>(INITIAL_METAS);
  const [showForm, setShowForm] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [filterPeriodo, setFilterPeriodo] = useState<string>("2026-04");
  const [filterTipo, setFilterTipo] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>("organizacao");

  const [form, setForm] = useState({
    periodo: "2026-04",
    tipoPeriodo: "mensal" as Meta["tipoPeriodo"],
    responsavel: "",
    tipoResponsavel: "vendedor" as Meta["tipoResponsavel"],
    tipoMeta: "receita_nova" as Meta["tipoMeta"],
    valorMeta: "",
  });

  const vendedores = ["Carlos Mendes", "Ana Oliveira", "Pedro Santos", "Mariana Costa", "Lucas Ferreira"];

  const filteredMetas = metas.filter((m) => {
    if (filterPeriodo && !m.periodo.startsWith(filterPeriodo)) return false;
    if (filterTipo && m.tipoMeta !== filterTipo) return false;
    return true;
  });

  const groupedMetas = useMemo(() => {
    const groups: Record<string, Meta[]> = { organizacao: [], equipe: [], vendedor: [] };
    filteredMetas.forEach((m) => {
      if (!groups[m.tipoResponsavel]) groups[m.tipoResponsavel] = [];
      groups[m.tipoResponsavel].push(m);
    });
    return groups;
  }, [filteredMetas]);

  const totalMeta = filteredMetas.filter((m) => m.tipoMeta === "receita_nova" || m.tipoMeta === "total").reduce((acc, m) => acc + m.valorMeta, 0);
  const totalAtual = filteredMetas.filter((m) => m.tipoMeta === "receita_nova" || m.tipoMeta === "total").reduce((acc, m) => acc + m.valorAtual, 0);
  const metasAtingidas = filteredMetas.filter((m) => m.valorAtual >= m.valorMeta).length;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatValue = (meta: Meta) => {
    if (meta.tipoMeta === "deals_ganhos" || meta.tipoMeta === "leads_qualificados") {
      return meta.valorAtual.toString();
    }
    return formatCurrency(meta.valorAtual);
  };

  const formatMetaValue = (meta: Meta) => {
    if (meta.tipoMeta === "deals_ganhos" || meta.tipoMeta === "leads_qualificados") {
      return meta.valorMeta.toString();
    }
    return formatCurrency(meta.valorMeta);
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 100) return "text-green-400";
    if (pct >= 75) return "text-blue-400";
    if (pct >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const openForm = (meta?: Meta) => {
    if (meta) {
      setForm({
        periodo: meta.periodo,
        tipoPeriodo: meta.tipoPeriodo,
        responsavel: meta.responsavel,
        tipoResponsavel: meta.tipoResponsavel,
        tipoMeta: meta.tipoMeta,
        valorMeta: meta.valorMeta.toString(),
      });
      setEditingMeta(meta);
    } else {
      setForm({ periodo: "2026-04", tipoPeriodo: "mensal", responsavel: "", tipoResponsavel: "vendedor", tipoMeta: "receita_nova", valorMeta: "" });
      setEditingMeta(null);
    }
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.responsavel.trim()) {
      toast.error("Responsável é obrigatório");
      return;
    }
    if (!form.valorMeta || parseFloat(form.valorMeta) <= 0) {
      toast.error("Valor da meta é obrigatório");
      return;
    }

    if (editingMeta) {
      setMetas(metas.map((m) =>
        m.id === editingMeta.id
          ? { ...m, periodo: form.periodo, tipoPeriodo: form.tipoPeriodo, responsavel: form.responsavel, tipoResponsavel: form.tipoResponsavel, tipoMeta: form.tipoMeta, valorMeta: parseFloat(form.valorMeta) }
          : m
      ));
      toast.success("Meta atualizada!");
    } else {
      setMetas([...metas, {
        id: Date.now().toString(),
        periodo: form.periodo,
        tipoPeriodo: form.tipoPeriodo,
        responsavel: form.responsavel,
        tipoResponsavel: form.tipoResponsavel,
        tipoMeta: form.tipoMeta,
        valorMeta: parseFloat(form.valorMeta),
        valorAtual: 0,
        ativo: true,
      }]);
      toast.success("Meta criada!");
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setMetas(metas.filter((m) => m.id !== id));
    toast.success("Meta excluída");
  };

  const GROUP_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
    organizacao: { label: "Organização", icon: <Target className="w-4 h-4 text-blue-400" /> },
    equipe: { label: "Equipes", icon: <Users className="w-4 h-4 text-purple-400" /> },
    vendedor: { label: "Vendedores", icon: <Users className="w-4 h-4 text-green-400" /> },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Target className="w-7 h-7 text-yellow-400" />
            <h1 className="text-2xl font-bold">Metas de Vendas</h1>
          </div>
          <p className="text-gray-400 mt-1 ml-10">
            Defina e acompanhe metas por período, vendedor e tipo de receita
          </p>
        </div>
        <Button onClick={() => openForm()} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{filteredMetas.length}</p>
            <p className="text-xs text-gray-400">Metas no período</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{metasAtingidas}</p>
            <p className="text-xs text-gray-400">Metas atingidas</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-yellow-400">{formatCurrency(totalMeta)}</p>
            <p className="text-xs text-gray-400">Meta total</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-purple-400">{formatCurrency(totalAtual)}</p>
            <p className="text-xs text-gray-400">Realizado</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Período:</span>
        </div>
        {["2026-04", "2026-03", "2026-Q2", "2026"].map((p) => (
          <Button
            key={p}
            variant={filterPeriodo === p ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPeriodo(p)}
            className={filterPeriodo === p ? "bg-blue-600" : "border-gray-600 text-gray-300"}
          >
            {p === "2026-04" ? "Abr/2026" : p === "2026-03" ? "Mar/2026" : p === "2026-Q2" ? "Q2/2026" : "2026"}
          </Button>
        ))}
        <Separator orientation="vertical" className="h-6 bg-gray-700" />
        <div className="flex gap-1">
          <Button
            variant={filterTipo === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTipo(null)}
            className={filterTipo === null ? "bg-blue-600" : "border-gray-600 text-gray-300"}
          >
            Todos
          </Button>
          {Object.entries(TIPO_META_LABELS).map(([k, v]) => (
            <Button
              key={k}
              variant={filterTipo === k ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTipo(k)}
              className={filterTipo === k ? "bg-blue-600" : "border-gray-600 text-gray-300"}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>

      {/* Grouped Metas */}
      <div className="space-y-4">
        {(["organizacao", "equipe", "vendedor"] as const).map((groupKey) => {
          const groupMetas = groupedMetas[groupKey] || [];
          if (groupMetas.length === 0) return null;
          const isExpanded = expandedGroup === groupKey;
          const groupInfo = GROUP_LABELS[groupKey];

          return (
            <Card key={groupKey} className="bg-gray-800 border-gray-700 overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-750"
                onClick={() => setExpandedGroup(isExpanded ? null : groupKey)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  {groupInfo.icon}
                  <h3 className="font-semibold">{groupInfo.label}</h3>
                  <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                    {groupMetas.length} metas
                  </Badge>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-700 p-4 space-y-3">
                  {groupMetas.map((meta) => {
                    const pct = meta.valorMeta > 0 ? Math.round((meta.valorAtual / meta.valorMeta) * 100) : 0;
                    const progressColor = getProgressColor(pct);

                    return (
                      <div key={meta.id} className="p-4 bg-gray-700/30 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{meta.responsavel}</span>
                                <Badge className={`text-xs ${TIPO_META_CORES[meta.tipoMeta] || "bg-gray-700 text-gray-300"}`}>
                                  {TIPO_META_LABELS[meta.tipoMeta]}
                                </Badge>
                                <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                                  {TIPO_PERIODO_LABELS[meta.tipoPeriodo]}
                                </Badge>
                                {!meta.ativo && (
                                  <Badge className="bg-gray-600/50 text-gray-400 text-xs">Encerrada</Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">Período: {meta.periodo}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${progressColor}`}>{pct}%</span>
                            {meta.ativo && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => openForm(meta)} className="text-blue-400 hover:text-blue-300 h-7 w-7 p-0">
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(meta.id)} className="text-red-400 hover:text-red-300 h-7 w-7 p-0">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Realizado: {formatValue(meta)}</span>
                            <span>Meta: {formatMetaValue(meta)}</span>
                          </div>
                          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct >= 100 ? "bg-green-500" : pct >= 75 ? "bg-blue-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          {pct >= 100 && (
                            <div className="flex items-center gap-1 text-xs text-green-400">
                              <Award className="w-3 h-3" />
                              <span>Meta atingida! +{formatValue({ ...meta, valorAtual: meta.valorAtual - meta.valorMeta })} acima da meta</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredMetas.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma meta encontrada para este período</p>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMeta ? "Editar Meta" : "Nova Meta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Tipo de Período</label>
                <select
                  value={form.tipoPeriodo}
                  onChange={(e) => setForm({ ...form, tipoPeriodo: e.target.value as Meta["tipoPeriodo"] })}
                  className="mt-1 w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-sm text-white"
                >
                  {Object.entries(TIPO_PERIODO_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Período</label>
                <Input
                  value={form.periodo}
                  onChange={(e) => setForm({ ...form, periodo: e.target.value })}
                  placeholder="Ex: 2026-04, 2026-Q2, 2026"
                  className="mt-1 bg-gray-700 border-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Nível</label>
                <select
                  value={form.tipoResponsavel}
                  onChange={(e) => {
                    const tipo = e.target.value as Meta["tipoResponsavel"];
                    setForm({
                      ...form,
                      tipoResponsavel: tipo,
                      responsavel: tipo === "organizacao" ? "Tração Comercial" : "",
                    });
                  }}
                  className="mt-1 w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-sm text-white"
                >
                  <option value="organizacao">Organização</option>
                  <option value="equipe">Equipe</option>
                  <option value="vendedor">Vendedor</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Responsável *</label>
                {form.tipoResponsavel === "vendedor" ? (
                  <select
                    value={form.responsavel}
                    onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                    className="mt-1 w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-sm text-white"
                  >
                    <option value="">Selecione...</option>
                    {vendedores.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={form.responsavel}
                    onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                    placeholder="Nome da equipe ou organização"
                    className="mt-1 bg-gray-700 border-gray-600"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Tipo de Meta</label>
                <select
                  value={form.tipoMeta}
                  onChange={(e) => setForm({ ...form, tipoMeta: e.target.value as Meta["tipoMeta"] })}
                  className="mt-1 w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-sm text-white"
                >
                  {Object.entries(TIPO_META_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Valor da Meta * {form.tipoMeta === "deals_ganhos" || form.tipoMeta === "leads_qualificados" ? "(quantidade)" : "(R$)"}
                </label>
                <Input
                  type="number"
                  min={0}
                  value={form.valorMeta}
                  onChange={(e) => setForm({ ...form, valorMeta: e.target.value })}
                  placeholder={form.tipoMeta === "deals_ganhos" ? "Ex: 10" : "Ex: 150000"}
                  className="mt-1 bg-gray-700 border-gray-600"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-700">
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-gray-600">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                {editingMeta ? "Salvar Alterações" : "Criar Meta"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
