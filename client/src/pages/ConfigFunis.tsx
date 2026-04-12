import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Layers,
  ArrowRight,
  ArrowLeft,
  Shield,
  FileCheck,
  AlertTriangle,
  Copy,
  MoreVertical,
  Settings,
} from "lucide-react";

// ─── Types ───
interface StageGate {
  id: string;
  tipo: "entrada" | "saida";
  descricao: string;
}

interface CampoObrigatorio {
  id: string;
  nome: string;
  campo: string;
}

interface PipelineStage {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
  probabilidade: number;
  criteriosEntrada: string[];
  criteriosSaida: string[];
  camposObrigatorios: string[];
  evidenciasMinimas: string[];
  descricao: string;
  ativo: boolean;
}

interface Pipeline {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  padrao: boolean;
  stages: PipelineStage[];
}

// ─── Mock Data ───
const CORES_ESTAGIO = [
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
  "#EC4899", "#EF4444", "#F97316", "#EAB308",
  "#22C55E", "#14B8A6", "#06B6D4", "#64748B",
];

const INITIAL_PIPELINES: Pipeline[] = [
  {
    id: "1",
    nome: "Vendas Novas",
    descricao: "Pipeline principal para novas oportunidades de vendas consultivas B2B",
    ativo: true,
    padrao: true,
    stages: [
      {
        id: "s1", nome: "Novo Lead Qualificado", cor: "#3B82F6", ordem: 1, probabilidade: 10,
        criteriosEntrada: ["Lead qualificado pelo SDR", "Fit mínimo com ICP confirmado"],
        criteriosSaida: ["Diagnóstico agendado com decisor", "Briefing preenchido"],
        camposObrigatorios: ["Empresa", "Contato principal", "Segmento"],
        evidenciasMinimas: ["Email de confirmação do agendamento"],
        descricao: "Lead recém-qualificado que atende ao ICP e está pronto para diagnóstico",
        ativo: true,
      },
      {
        id: "s2", nome: "Diagnóstico Agendado", cor: "#6366F1", ordem: 2, probabilidade: 15,
        criteriosEntrada: ["Reunião de diagnóstico confirmada", "Decisor ou influenciador presente"],
        criteriosSaida: ["Diagnóstico realizado", "Dores mapeadas (SPIN)"],
        camposObrigatorios: ["Data da reunião", "Participantes confirmados"],
        evidenciasMinimas: ["Convite de calendário aceito"],
        descricao: "Reunião de diagnóstico agendada com stakeholder relevante",
        ativo: true,
      },
      {
        id: "s3", nome: "Diagnóstico Realizado", cor: "#8B5CF6", ordem: 3, probabilidade: 25,
        criteriosEntrada: ["Reunião de diagnóstico concluída", "Campos SPIN preenchidos"],
        criteriosSaida: ["Oportunidade qualificada formalmente", "Budget estimado"],
        camposObrigatorios: ["SPIN Situação", "SPIN Problema", "SPIN Implicação", "SPIN Necessidade"],
        evidenciasMinimas: ["Ata da reunião", "Dores documentadas"],
        descricao: "Diagnóstico concluído com dores e necessidades mapeadas via SPIN",
        ativo: true,
      },
      {
        id: "s4", nome: "Oportunidade Qualificada", cor: "#A855F7", ordem: 4, probabilidade: 40,
        criteriosEntrada: ["BANT confirmado (Budget, Autoridade, Necessidade, Timing)", "Score de qualificação ≥ 5/7"],
        criteriosSaida: ["Solução desenhada e validada internamente"],
        camposObrigatorios: ["Budget confirmado", "Decisor mapeado", "Timeline definida"],
        evidenciasMinimas: ["Checklist de qualificação completo"],
        descricao: "Oportunidade formalmente qualificada com critérios BANT validados",
        ativo: true,
      },
      {
        id: "s5", nome: "Solução Desenhada", cor: "#EC4899", ordem: 5, probabilidade: 55,
        criteriosEntrada: ["Proposta técnica/comercial em elaboração"],
        criteriosSaida: ["Proposta apresentada ao cliente"],
        camposObrigatorios: ["Produtos selecionados", "Valor estimado"],
        evidenciasMinimas: ["Documento de proposta rascunho"],
        descricao: "Solução customizada desenhada para atender as necessidades do cliente",
        ativo: true,
      },
      {
        id: "s6", nome: "Proposta Apresentada", cor: "#F97316", ordem: 6, probabilidade: 65,
        criteriosEntrada: ["Proposta formal enviada/apresentada ao decisor"],
        criteriosSaida: ["Feedback recebido", "Negociação iniciada ou aceite"],
        camposObrigatorios: ["Valor da proposta", "Data de apresentação", "Participantes"],
        evidenciasMinimas: ["Proposta enviada por email", "Ata da apresentação"],
        descricao: "Proposta comercial formalmente apresentada ao comitê decisor",
        ativo: true,
      },
      {
        id: "s7", nome: "Negociação", cor: "#EAB308", ordem: 7, probabilidade: 75,
        criteriosEntrada: ["Cliente demonstrou interesse em avançar", "Negociação de termos iniciada"],
        criteriosSaida: ["Acordo verbal ou commit formal"],
        camposObrigatorios: ["Valor negociado", "Condições comerciais", "Prazo de decisão"],
        evidenciasMinimas: ["Email de negociação", "Contraproposta documentada"],
        descricao: "Negociação ativa de termos comerciais, preço e condições",
        ativo: true,
      },
      {
        id: "s8", nome: "Commit / Decisão Iminente", cor: "#22C55E", ordem: 8, probabilidade: 90,
        criteriosEntrada: ["Acordo verbal confirmado", "Apenas formalização pendente"],
        criteriosSaida: ["Contrato assinado = Ganho", "Desistência = Perdido"],
        camposObrigatorios: ["Data prevista de fechamento", "Valor final"],
        evidenciasMinimas: ["Confirmação verbal ou por email do decisor"],
        descricao: "Decisão praticamente tomada, aguardando formalização/assinatura",
        ativo: true,
      },
    ],
  },
  {
    id: "2",
    nome: "Expansão de Contas",
    descricao: "Pipeline para upsell e cross-sell na base de clientes existentes",
    ativo: true,
    padrao: false,
    stages: [
      {
        id: "e1", nome: "Oportunidade Identificada", cor: "#14B8A6", ordem: 1, probabilidade: 20,
        criteriosEntrada: ["Gatilho de expansão detectado"],
        criteriosSaida: ["Reunião de discovery agendada"],
        camposObrigatorios: ["Conta existente", "Tipo de expansão"],
        evidenciasMinimas: ["Registro do gatilho"],
        descricao: "Oportunidade de expansão identificada em cliente ativo",
        ativo: true,
      },
      {
        id: "e2", nome: "Discovery Realizado", cor: "#06B6D4", ordem: 2, probabilidade: 40,
        criteriosEntrada: ["Reunião de discovery concluída"],
        criteriosSaida: ["Proposta de expansão elaborada"],
        camposObrigatorios: ["Novas necessidades mapeadas", "Produtos adicionais"],
        evidenciasMinimas: ["Ata de discovery"],
        descricao: "Discovery concluído com novas necessidades mapeadas",
        ativo: true,
      },
      {
        id: "e3", nome: "Proposta de Expansão", cor: "#F97316", ordem: 3, probabilidade: 60,
        criteriosEntrada: ["Proposta de upsell/cross-sell apresentada"],
        criteriosSaida: ["Aceite ou negociação"],
        camposObrigatorios: ["Valor incremental", "Produtos adicionais"],
        evidenciasMinimas: ["Proposta enviada"],
        descricao: "Proposta de expansão apresentada ao cliente",
        ativo: true,
      },
      {
        id: "e4", nome: "Fechamento", cor: "#22C55E", ordem: 4, probabilidade: 85,
        criteriosEntrada: ["Negociação concluída"],
        criteriosSaida: ["Contrato aditivo assinado"],
        camposObrigatorios: ["Valor final", "Data de início"],
        evidenciasMinimas: ["Contrato assinado"],
        descricao: "Fechamento da expansão com contrato aditivo",
        ativo: true,
      },
    ],
  },
];

// ─── Component ───
export default function ConfigFunis() {
  const [pipelines, setPipelines] = useState<Pipeline[]>(INITIAL_PIPELINES);
  const [expandedPipeline, setExpandedPipeline] = useState<string | null>("1");
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [showNewPipeline, setShowNewPipeline] = useState(false);
  const [showNewStage, setShowNewStage] = useState<string | null>(null);
  const [editingStage, setEditingStage] = useState<{ pipelineId: string; stage: PipelineStage } | null>(null);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);

  // New pipeline form
  const [newPipelineName, setNewPipelineName] = useState("");
  const [newPipelineDesc, setNewPipelineDesc] = useState("");

  // New/edit stage form
  const [stageForm, setStageForm] = useState({
    nome: "",
    cor: "#3B82F6",
    probabilidade: 50,
    descricao: "",
    criteriosEntrada: "",
    criteriosSaida: "",
    camposObrigatorios: "",
    evidenciasMinimas: "",
  });

  const totalPipelines = pipelines.length;
  const totalStages = pipelines.reduce((acc, p) => acc + p.stages.length, 0);
  const activePipelines = pipelines.filter((p) => p.ativo).length;

  // ─── Handlers ───
  const handleCreatePipeline = () => {
    if (!newPipelineName.trim()) {
      toast.error("Nome do funil é obrigatório");
      return;
    }
    const newPipeline: Pipeline = {
      id: Date.now().toString(),
      nome: newPipelineName,
      descricao: newPipelineDesc,
      ativo: true,
      padrao: false,
      stages: [],
    };
    setPipelines([...pipelines, newPipeline]);
    setNewPipelineName("");
    setNewPipelineDesc("");
    setShowNewPipeline(false);
    setExpandedPipeline(newPipeline.id);
    toast.success("Funil criado com sucesso!");
  };

  const handleDeletePipeline = (id: string) => {
    const pipeline = pipelines.find((p) => p.id === id);
    if (pipeline?.padrao) {
      toast.error("Não é possível excluir o funil padrão");
      return;
    }
    setPipelines(pipelines.filter((p) => p.id !== id));
    toast.success("Funil excluído");
  };

  const handleTogglePipeline = (id: string) => {
    setPipelines(
      pipelines.map((p) =>
        p.id === id ? { ...p, ativo: !p.ativo } : p
      )
    );
    toast.success("Status do funil atualizado");
  };

  const handleDuplicatePipeline = (id: string) => {
    const source = pipelines.find((p) => p.id === id);
    if (!source) return;
    const newPipeline: Pipeline = {
      ...source,
      id: Date.now().toString(),
      nome: `${source.nome} (Cópia)`,
      padrao: false,
      stages: source.stages.map((s) => ({ ...s, id: `${s.id}-copy-${Date.now()}` })),
    };
    setPipelines([...pipelines, newPipeline]);
    toast.success("Funil duplicado!");
  };

  const openStageForm = (pipelineId: string, stage?: PipelineStage) => {
    if (stage) {
      setStageForm({
        nome: stage.nome,
        cor: stage.cor,
        probabilidade: stage.probabilidade,
        descricao: stage.descricao,
        criteriosEntrada: stage.criteriosEntrada.join("\n"),
        criteriosSaida: stage.criteriosSaida.join("\n"),
        camposObrigatorios: stage.camposObrigatorios.join("\n"),
        evidenciasMinimas: stage.evidenciasMinimas.join("\n"),
      });
      setEditingStage({ pipelineId, stage });
    } else {
      setStageForm({
        nome: "",
        cor: CORES_ESTAGIO[pipelines.find((p) => p.id === pipelineId)?.stages.length || 0] || "#3B82F6",
        probabilidade: 50,
        descricao: "",
        criteriosEntrada: "",
        criteriosSaida: "",
        camposObrigatorios: "",
        evidenciasMinimas: "",
      });
      setShowNewStage(pipelineId);
    }
  };

  const handleSaveStage = () => {
    if (!stageForm.nome.trim()) {
      toast.error("Nome do estágio é obrigatório");
      return;
    }

    const parseLines = (text: string) =>
      text.split("\n").map((l) => l.trim()).filter(Boolean);

    const stageData: PipelineStage = {
      id: editingStage?.stage.id || Date.now().toString(),
      nome: stageForm.nome,
      cor: stageForm.cor,
      ordem: editingStage?.stage.ordem || 0,
      probabilidade: stageForm.probabilidade,
      descricao: stageForm.descricao,
      criteriosEntrada: parseLines(stageForm.criteriosEntrada),
      criteriosSaida: parseLines(stageForm.criteriosSaida),
      camposObrigatorios: parseLines(stageForm.camposObrigatorios),
      evidenciasMinimas: parseLines(stageForm.evidenciasMinimas),
      ativo: true,
    };

    const targetPipelineId = editingStage?.pipelineId || showNewStage;

    setPipelines(
      pipelines.map((p) => {
        if (p.id !== targetPipelineId) return p;
        if (editingStage) {
          return {
            ...p,
            stages: p.stages.map((s) =>
              s.id === editingStage.stage.id ? { ...stageData, ordem: s.ordem } : s
            ),
          };
        } else {
          return {
            ...p,
            stages: [...p.stages, { ...stageData, ordem: p.stages.length + 1 }],
          };
        }
      })
    );

    setEditingStage(null);
    setShowNewStage(null);
    toast.success(editingStage ? "Estágio atualizado!" : "Estágio criado!");
  };

  const handleDeleteStage = (pipelineId: string, stageId: string) => {
    setPipelines(
      pipelines.map((p) => {
        if (p.id !== pipelineId) return p;
        return {
          ...p,
          stages: p.stages
            .filter((s) => s.id !== stageId)
            .map((s, idx) => ({ ...s, ordem: idx + 1 })),
        };
      })
    );
    toast.success("Estágio removido");
  };

  const handleMoveStage = (pipelineId: string, stageId: string, direction: "up" | "down") => {
    setPipelines(
      pipelines.map((p) => {
        if (p.id !== pipelineId) return p;
        const idx = p.stages.findIndex((s) => s.id === stageId);
        if (idx < 0) return p;
        if (direction === "up" && idx === 0) return p;
        if (direction === "down" && idx === p.stages.length - 1) return p;
        const newStages = [...p.stages];
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        [newStages[idx], newStages[swapIdx]] = [newStages[swapIdx], newStages[idx]];
        return {
          ...p,
          stages: newStages.map((s, i) => ({ ...s, ordem: i + 1 })),
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Layers className="w-7 h-7 text-blue-400" />
            <h1 className="text-2xl font-bold">Funis de Vendas</h1>
          </div>
          <p className="text-gray-400 mt-1 ml-10">
            Configure os funis, estágios, critérios de passagem e campos obrigatórios
          </p>
        </div>
        <Button
          onClick={() => setShowNewPipeline(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Funil
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{totalPipelines}</p>
            <p className="text-xs text-gray-400">Funis criados</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{activePipelines}</p>
            <p className="text-xs text-gray-400">Funis ativos</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{totalStages}</p>
            <p className="text-xs text-gray-400">Estágios totais</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipelines List */}
      <div className="space-y-4">
        {pipelines.map((pipeline) => (
          <Card key={pipeline.id} className="bg-gray-800 border-gray-700 overflow-hidden">
            {/* Pipeline Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-750"
              onClick={() =>
                setExpandedPipeline(expandedPipeline === pipeline.id ? null : pipeline.id)
              }
            >
              <div className="flex items-center gap-3">
                {expandedPipeline === pipeline.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{pipeline.nome}</h3>
                    {pipeline.padrao && (
                      <Badge className="bg-blue-600/20 text-blue-300 text-xs">Padrão</Badge>
                    )}
                    {!pipeline.ativo && (
                      <Badge className="bg-gray-600/50 text-gray-400 text-xs">Inativo</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{pipeline.descricao}</p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {pipeline.stages.length} estágios
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDuplicatePipeline(pipeline.id)}
                  className="text-gray-400 hover:text-white"
                  title="Duplicar funil"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Switch
                  checked={pipeline.ativo}
                  onCheckedChange={() => handleTogglePipeline(pipeline.id)}
                />
                {!pipeline.padrao && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePipeline(pipeline.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Expanded: Stages */}
            {expandedPipeline === pipeline.id && (
              <div className="border-t border-gray-700">
                {/* Visual Pipeline Flow */}
                <div className="p-4 bg-gray-850 overflow-x-auto">
                  <div className="flex items-center gap-1 min-w-max">
                    {pipeline.stages.map((stage, idx) => (
                      <React.Fragment key={stage.id}>
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                            expandedStage === stage.id
                              ? "ring-2 ring-yellow-500 bg-gray-700"
                              : "bg-gray-700/50 hover:bg-gray-700"
                          }`}
                          onClick={() =>
                            setExpandedStage(expandedStage === stage.id ? null : stage.id)
                          }
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: stage.cor }}
                          />
                          <span className="text-xs font-medium whitespace-nowrap">{stage.nome}</span>
                          <span className="text-xs text-gray-400">{stage.probabilidade}%</span>
                        </div>
                        {idx < pipeline.stages.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openStageForm(pipeline.id)}
                      className="text-yellow-400 hover:text-yellow-300 ml-2"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      <span className="text-xs">Estágio</span>
                    </Button>
                  </div>
                </div>

                {/* Stage Details */}
                <div className="p-4 space-y-2">
                  {pipeline.stages.map((stage, idx) => (
                    <div key={stage.id}>
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                          expandedStage === stage.id
                            ? "bg-gray-700 ring-1 ring-gray-600"
                            : "bg-gray-700/30 hover:bg-gray-700/50"
                        }`}
                        onClick={() =>
                          setExpandedStage(expandedStage === stage.id ? null : stage.id)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-gray-500" />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: stage.cor }}
                          />
                          <div>
                            <span className="font-medium">{stage.nome}</span>
                            <span className="text-xs text-gray-400 ml-2">
                              Ordem {stage.ordem} · {stage.probabilidade}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveStage(pipeline.id, stage.id, "up")}
                            disabled={idx === 0}
                            className="text-gray-400 hover:text-white h-7 w-7 p-0"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveStage(pipeline.id, stage.id, "down")}
                            disabled={idx === pipeline.stages.length - 1}
                            className="text-gray-400 hover:text-white h-7 w-7 p-0"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openStageForm(pipeline.id, stage)}
                            className="text-blue-400 hover:text-blue-300 h-7 w-7 p-0"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStage(pipeline.id, stage.id)}
                            className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Stage Detail */}
                      {expandedStage === stage.id && (
                        <div className="ml-8 mt-2 mb-3 p-4 bg-gray-800/80 rounded-lg border border-gray-700 space-y-4">
                          <p className="text-sm text-gray-300">{stage.descricao}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Critérios de Entrada */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-green-400">
                                <ArrowRight className="w-4 h-4" />
                                <span className="text-sm font-semibold">Critérios de Entrada</span>
                              </div>
                              {stage.criteriosEntrada.length > 0 ? (
                                <ul className="space-y-1">
                                  {stage.criteriosEntrada.map((c, i) => (
                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                      <span className="text-green-400 mt-1">•</span>
                                      {c}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-gray-500 italic">Nenhum critério definido</p>
                              )}
                            </div>

                            {/* Critérios de Saída */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-orange-400">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm font-semibold">Critérios de Saída</span>
                              </div>
                              {stage.criteriosSaida.length > 0 ? (
                                <ul className="space-y-1">
                                  {stage.criteriosSaida.map((c, i) => (
                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                      <span className="text-orange-400 mt-1">•</span>
                                      {c}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-gray-500 italic">Nenhum critério definido</p>
                              )}
                            </div>

                            {/* Campos Obrigatórios */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-blue-400">
                                <FileCheck className="w-4 h-4" />
                                <span className="text-sm font-semibold">Campos Obrigatórios</span>
                              </div>
                              {stage.camposObrigatorios.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {stage.camposObrigatorios.map((c, i) => (
                                    <Badge key={i} className="bg-blue-900/30 text-blue-300 text-xs">
                                      {c}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500 italic">Nenhum campo obrigatório</p>
                              )}
                            </div>

                            {/* Evidências Mínimas */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-yellow-400">
                                <Shield className="w-4 h-4" />
                                <span className="text-sm font-semibold">Evidências Mínimas</span>
                              </div>
                              {stage.evidenciasMinimas.length > 0 ? (
                                <ul className="space-y-1">
                                  {stage.evidenciasMinimas.map((c, i) => (
                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                      <span className="text-yellow-400 mt-1">•</span>
                                      {c}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-gray-500 italic">Nenhuma evidência definida</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {pipeline.stages.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>Nenhum estágio configurado</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 border-gray-600"
                        onClick={() => openStageForm(pipeline.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar primeiro estágio
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* New Pipeline Dialog */}
      <Dialog open={showNewPipeline} onOpenChange={setShowNewPipeline}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Funil de Vendas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-gray-300">Nome *</label>
              <Input
                value={newPipelineName}
                onChange={(e) => setNewPipelineName(e.target.value)}
                placeholder="Ex: Vendas Inbound, Expansão Enterprise..."
                className="mt-1 bg-gray-700 border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Descrição</label>
              <Textarea
                value={newPipelineDesc}
                onChange={(e) => setNewPipelineDesc(e.target.value)}
                placeholder="Descreva o objetivo deste funil..."
                className="mt-1 bg-gray-700 border-gray-600"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowNewPipeline(false)} className="border-gray-600">
                Cancelar
              </Button>
              <Button onClick={handleCreatePipeline} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                Criar Funil
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New/Edit Stage Dialog */}
      <Dialog
        open={!!showNewStage || !!editingStage}
        onOpenChange={() => {
          setShowNewStage(null);
          setEditingStage(null);
        }}
      >
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStage ? `Editar Estágio: ${editingStage.stage.nome}` : "Novo Estágio"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Nome *</label>
                <Input
                  value={stageForm.nome}
                  onChange={(e) => setStageForm({ ...stageForm, nome: e.target.value })}
                  placeholder="Ex: Diagnóstico Realizado"
                  className="mt-1 bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Probabilidade (%)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={stageForm.probabilidade}
                  onChange={(e) =>
                    setStageForm({ ...stageForm, probabilidade: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1 bg-gray-700 border-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Cor</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={stageForm.cor}
                    onChange={(e) => setStageForm({ ...stageForm, cor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                  />
                  <div className="flex gap-1 flex-wrap">
                    {CORES_ESTAGIO.map((cor) => (
                      <button
                        key={cor}
                        onClick={() => setStageForm({ ...stageForm, cor })}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          stageForm.cor === cor ? "border-white scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: cor }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Descrição</label>
                <Input
                  value={stageForm.descricao}
                  onChange={(e) => setStageForm({ ...stageForm, descricao: e.target.value })}
                  placeholder="Breve descrição do estágio"
                  className="mt-1 bg-gray-700 border-gray-600"
                />
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div>
              <label className="text-sm font-medium text-green-400 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Critérios de Entrada
              </label>
              <p className="text-xs text-gray-500 mb-1">Um critério por linha. O que precisa acontecer para o deal entrar neste estágio.</p>
              <Textarea
                value={stageForm.criteriosEntrada}
                onChange={(e) => setStageForm({ ...stageForm, criteriosEntrada: e.target.value })}
                placeholder={"Reunião de diagnóstico confirmada\nDecisão ou influenciador presente"}
                className="mt-1 bg-gray-700 border-gray-600"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-orange-400 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Critérios de Saída
              </label>
              <p className="text-xs text-gray-500 mb-1">Um critério por linha. O que precisa acontecer para o deal avançar para o próximo estágio.</p>
              <Textarea
                value={stageForm.criteriosSaida}
                onChange={(e) => setStageForm({ ...stageForm, criteriosSaida: e.target.value })}
                placeholder={"Diagnóstico realizado\nDores mapeadas (SPIN)"}
                className="mt-1 bg-gray-700 border-gray-600"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-blue-400 flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Campos Obrigatórios
              </label>
              <p className="text-xs text-gray-500 mb-1">Um campo por linha. Campos que devem ser preenchidos neste estágio.</p>
              <Textarea
                value={stageForm.camposObrigatorios}
                onChange={(e) => setStageForm({ ...stageForm, camposObrigatorios: e.target.value })}
                placeholder={"Data da reunião\nParticipantes confirmados"}
                className="mt-1 bg-gray-700 border-gray-600"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-yellow-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Evidências Mínimas
              </label>
              <p className="text-xs text-gray-500 mb-1">Um item por linha. Evidências que comprovam o avanço real do deal.</p>
              <Textarea
                value={stageForm.evidenciasMinimas}
                onChange={(e) => setStageForm({ ...stageForm, evidenciasMinimas: e.target.value })}
                placeholder={"Convite de calendário aceito\nEmail de confirmação"}
                className="mt-1 bg-gray-700 border-gray-600"
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewStage(null);
                  setEditingStage(null);
                }}
                className="border-gray-600"
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveStage} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                {editingStage ? "Salvar Alterações" : "Criar Estágio"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
