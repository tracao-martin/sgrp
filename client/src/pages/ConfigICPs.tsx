import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  Target,
  Plus,
  Pencil,
  Trash2,
  Loader,
  X,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Tag,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";

// Helper to parse JSON text fields safely
function parseJsonArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonCriterios(
  val: string | null | undefined
): Array<{ label: string; value: string }> {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Tag input component for multi-value fields
function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  };

  const removeTag = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="bg-[#333333] border-border text-white"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          className="border-border shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm border border-primary/25"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Porte selector with checkboxes
const PORTE_OPTIONS = [
  { value: "micro", label: "Micro" },
  { value: "pequena", label: "Pequena" },
  { value: "media", label: "Média" },
  { value: "grande", label: "Grande" },
  { value: "multinacional", label: "Multinacional" },
];

function PorteSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (porte: string) => {
    if (value.includes(porte)) {
      onChange(value.filter((p) => p !== porte));
    } else {
      onChange([...value, porte]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {PORTE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
            value.includes(opt.value)
              ? "bg-primary/30 border-primary text-primary"
              : "bg-[#333333] border-border text-muted-foreground hover:border-primary/40"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Custom criteria input
function CriteriosInput({
  value,
  onChange,
}: {
  value: Array<{ label: string; value: string }>;
  onChange: (v: Array<{ label: string; value: string }>) => void;
}) {
  const [label, setLabel] = useState("");
  const [val, setVal] = useState("");

  const add = () => {
    if (label.trim()) {
      onChange([...value, { label: label.trim(), value: val.trim() }]);
      setLabel("");
      setVal("");
    }
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Critério (ex: Nº de funcionários)"
          className="bg-[#333333] border-border text-white flex-1"
        />
        <Input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Valor (ex: > 50)"
          className="bg-[#333333] border-border text-white flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          className="border-border shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="space-y-1">
          {value.map((c, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-2 bg-[#333333]/50 rounded-lg"
            >
              <span className="text-sm">
                <span className="text-foreground/80 font-medium">{c.label}</span>
                {c.value && (
                  <span className="text-muted-foreground ml-2">→ {c.value}</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-muted-foreground hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Format currency for display
function formatCurrency(val: string | number | null | undefined): string {
  if (!val) return "";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "";
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

interface ICPFormData {
  nome: string;
  descricao: string;
  segmentos: string[];
  portes: string[];
  faixaReceitaMin: string;
  faixaReceitaMax: string;
  cargosDecisor: string[];
  localizacoes: string[];
  criteriosCustom: Array<{ label: string; value: string }>;
}

const emptyForm: ICPFormData = {
  nome: "",
  descricao: "",
  segmentos: [],
  portes: [],
  faixaReceitaMin: "",
  faixaReceitaMax: "",
  cargosDecisor: [],
  localizacoes: [],
  criteriosCustom: [],
};

export default function ConfigICPs() {
  const icpsQuery = trpc.crm.icps.list.useQuery();
  const icpsList = icpsQuery.data || [];
  const utils = trpc.useUtils();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ICPFormData>({ ...emptyForm });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const createMutation = trpc.crm.icps.create.useMutation({
    onSuccess: () => {
      toast.success("ICP criado com sucesso!");
      utils.crm.icps.list.invalidate();
      resetForm();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const updateMutation = trpc.crm.icps.update.useMutation({
    onSuccess: () => {
      toast.success("ICP atualizado com sucesso!");
      utils.crm.icps.list.invalidate();
      resetForm();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const deleteMutation = trpc.crm.icps.delete.useMutation({
    onSuccess: () => {
      toast.success("ICP excluído!");
      utils.crm.icps.list.invalidate();
      setDeleteConfirmId(null);
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const toggleActiveMutation = trpc.crm.icps.update.useMutation({
    onSuccess: () => {
      utils.crm.icps.list.invalidate();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const resetForm = () => {
    setForm({ ...emptyForm });
    setShowForm(false);
    setEditingId(null);
  };

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (icp: any) => {
    setForm({
      nome: icp.nome || "",
      descricao: icp.descricao || "",
      segmentos: parseJsonArray(icp.segmentos),
      portes: parseJsonArray(icp.portes),
      faixaReceitaMin: icp.faixaReceitaMin || "",
      faixaReceitaMax: icp.faixaReceitaMax || "",
      cargosDecisor: parseJsonArray(icp.cargosDecisor),
      localizacoes: parseJsonArray(icp.localizacoes),
      criteriosCustom: parseJsonCriterios(icp.criteriosCustom),
    });
    setEditingId(icp.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    const payload = {
      nome: form.nome,
      descricao: form.descricao || undefined,
      segmentos: form.segmentos.length > 0 ? form.segmentos : undefined,
      portes: form.portes.length > 0 ? form.portes : undefined,
      faixaReceitaMin: form.faixaReceitaMin
        ? parseFloat(form.faixaReceitaMin)
        : undefined,
      faixaReceitaMax: form.faixaReceitaMax
        ? parseFloat(form.faixaReceitaMax)
        : undefined,
      cargosDecisor:
        form.cargosDecisor.length > 0 ? form.cargosDecisor : undefined,
      localizacoes:
        form.localizacoes.length > 0 ? form.localizacoes : undefined,
      criteriosCustom:
        form.criteriosCustom.length > 0 ? form.criteriosCustom : undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleActive = (icp: any) => {
    toggleActiveMutation.mutate({ id: icp.id, ativo: !icp.ativo });
  };

  const activeCount = icpsList.filter((i: any) => i.ativo).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            ICPs — Perfis de Cliente Ideal
          </h1>
          <p className="text-muted-foreground mt-1">
            {icpsList.length} perfil(is) cadastrado(s)
            {activeCount < icpsList.length && (
              <span className="ml-2 text-muted-foreground">
                ({activeCount} ativo{activeCount !== 1 ? "s" : ""})
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo ICP
        </Button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Editar ICP" : "Novo ICP"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                Nome *
              </label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Diretor de TI em SaaS B2B"
                className="bg-[#333333] border-border text-white"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                Descrição <span className="text-muted-foreground">(opcional)</span>
              </label>
              <Textarea
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                placeholder="Descreva brevemente este perfil..."
                className="bg-[#333333] border-border text-white min-h-[80px]"
              />
            </div>

            {/* Segmentos */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                <Tag className="w-4 h-4 inline mr-1" />
                Segmentos de Mercado
              </label>
              <TagInput
                value={form.segmentos}
                onChange={(v) => setForm({ ...form, segmentos: v })}
                placeholder="Ex: Tecnologia, Saúde, Educação..."
              />
            </div>

            {/* Portes */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                <Building2 className="w-4 h-4 inline mr-1" />
                Porte da Empresa
              </label>
              <PorteSelector
                value={form.portes}
                onChange={(v) => setForm({ ...form, portes: v })}
              />
            </div>

            {/* Faixa de Receita */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Faixa de Receita Anual (R$)
              </label>
              <div className="flex gap-3 items-center">
                <Input
                  type="number"
                  value={form.faixaReceitaMin}
                  onChange={(e) =>
                    setForm({ ...form, faixaReceitaMin: e.target.value })
                  }
                  placeholder="Mínimo"
                  className="bg-[#333333] border-border text-white"
                />
                <span className="text-muted-foreground">até</span>
                <Input
                  type="number"
                  value={form.faixaReceitaMax}
                  onChange={(e) =>
                    setForm({ ...form, faixaReceitaMax: e.target.value })
                  }
                  placeholder="Máximo"
                  className="bg-[#333333] border-border text-white"
                />
              </div>
            </div>

            {/* Cargos Decisor */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Cargos do Decisor
              </label>
              <TagInput
                value={form.cargosDecisor}
                onChange={(v) => setForm({ ...form, cargosDecisor: v })}
                placeholder="Ex: CEO, CTO, Diretor de TI..."
              />
            </div>

            {/* Localizações */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Localizações
              </label>
              <TagInput
                value={form.localizacoes}
                onChange={(v) => setForm({ ...form, localizacoes: v })}
                placeholder="Ex: São Paulo, Rio de Janeiro, Brasil..."
              />
            </div>

            {/* Critérios Customizados */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                Critérios Customizados{" "}
                <span className="text-muted-foreground">(opcional)</span>
              </label>
              <CriteriosInput
                value={form.criteriosCustom}
                onChange={(v) => setForm({ ...form, criteriosCustom: v })}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-border"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  createMutation.isPending || updateMutation.isPending
                }
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingId ? "Salvar Alterações" : "Criar ICP"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ICPs List */}
      {icpsQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : icpsList.length === 0 && !showForm ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground/80 mb-2">
              Nenhum ICP cadastrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Defina seus Perfis de Cliente Ideal para qualificar melhor seus
              leads e oportunidades.
            </p>
            <Button
              onClick={openCreate}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro ICP
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {icpsList.map((icp: any) => {
            const segmentos = parseJsonArray(icp.segmentos);
            const portes = parseJsonArray(icp.portes);
            const cargos = parseJsonArray(icp.cargosDecisor);
            const locais = parseJsonArray(icp.localizacoes);
            const criterios = parseJsonCriterios(icp.criteriosCustom);
            const isExpanded = expandedId === icp.id;

            return (
              <Card
                key={icp.id}
                className={`border transition-colors ${
                  icp.ativo
                    ? "bg-card border-border"
                    : "bg-card/50 border-border/50 opacity-70"
                }`}
              >
                <CardContent className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : icp.id)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {icp.nome}
                        </h3>
                        {!icp.ativo && (
                          <span className="text-xs px-2 py-0.5 bg-[#444444] text-foreground/80 rounded">
                            Inativo
                          </span>
                        )}
                      </div>
                      {icp.descricao && (
                        <p className="text-muted-foreground text-sm mt-1">
                          {icp.descricao}
                        </p>
                      )}

                      {/* Summary tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {segmentos.slice(0, 3).map((s, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                        {portes.length > 0 && (
                          <span className="text-xs px-2 py-1 bg-green-600/20 text-green-300 rounded-full">
                            {portes
                              .map(
                                (p) =>
                                  PORTE_OPTIONS.find((o) => o.value === p)
                                    ?.label || p
                              )
                              .join(", ")}
                          </span>
                        )}
                        {(icp.faixaReceitaMin || icp.faixaReceitaMax) && (
                          <span className="text-xs px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded-full">
                            {formatCurrency(icp.faixaReceitaMin) || "R$ 0"} —{" "}
                            {formatCurrency(icp.faixaReceitaMax) || "∞"}
                          </span>
                        )}
                        {segmentos.length > 3 && (
                          <span className="text-xs px-2 py-1 text-muted-foreground">
                            +{segmentos.length - 3} mais
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleActive(icp)}
                        className="p-2 hover:bg-[#333333] rounded-lg transition-colors"
                        title={icp.ativo ? "Desativar" : "Ativar"}
                      >
                        {icp.ativo ? (
                          <ToggleRight className="w-5 h-5 text-green-400" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(icp)}
                        className="p-2 hover:bg-[#333333] rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4 text-primary" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(icp.id)}
                        className="p-2 hover:bg-[#333333] rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : icp.id)
                        }
                        className="p-2 hover:bg-[#333333] rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                      {segmentos.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> Segmentos
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {segmentos.map((s, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {portes.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> Porte
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {portes.map((p, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 bg-green-600/20 text-green-300 rounded-full"
                              >
                                {PORTE_OPTIONS.find((o) => o.value === p)
                                  ?.label || p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(icp.faixaReceitaMin || icp.faixaReceitaMax) && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Faixa de Receita
                          </p>
                          <p className="text-sm text-yellow-300">
                            {formatCurrency(icp.faixaReceitaMin) || "R$ 0"} —{" "}
                            {formatCurrency(icp.faixaReceitaMax) || "Sem limite"}
                          </p>
                        </div>
                      )}

                      {cargos.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Cargos Decisor
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {cargos.map((c, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {locais.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Localizações
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {locais.map((l, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 bg-orange-600/20 text-orange-300 rounded-full"
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {criterios.length > 0 && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-muted-foreground mb-2">
                            Critérios Customizados
                          </p>
                          <div className="space-y-1">
                            {criterios.map((c, i) => (
                              <div
                                key={i}
                                className="text-sm px-3 py-2 bg-[#333333]/50 rounded-lg"
                              >
                                <span className="text-foreground/80 font-medium">
                                  {c.label}
                                </span>
                                {c.value && (
                                  <span className="text-muted-foreground ml-2">
                                    → {c.value}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Tem certeza que deseja excluir este ICP? Esta ação não pode ser
            desfeita.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirmId) {
                  deleteMutation.mutate({ id: deleteConfirmId });
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
