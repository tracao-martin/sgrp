import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus,
  Zap,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MessageSquare,
  CheckSquare,
  Clock,
  ArrowDown,
  Copy,
  Play,
  Pause,
  GripVertical,
  Calendar,
} from "lucide-react";

interface CadenciaStep {
  id: string;
  dia: number;
  tipo: "email" | "ligacao" | "whatsapp" | "tarefa" | "linkedin";
  titulo: string;
  descricao: string;
}

interface Cadencia {
  id: string;
  nome: string;
  descricao: string;
  gatilho: string;
  ativa: boolean;
  steps: CadenciaStep[];
  totalContatos: number;
  taxaResposta: number;
}

const TIPO_STEP_CONFIG: Record<string, { label: string; icon: React.ReactNode; cor: string }> = {
  email: { label: "Email", icon: <Mail className="w-4 h-4" />, cor: "bg-blue-900/30 text-blue-300 border-blue-800" },
  ligacao: { label: "Ligação", icon: <Phone className="w-4 h-4" />, cor: "bg-green-900/30 text-green-300 border-green-800" },
  whatsapp: { label: "WhatsApp", icon: <MessageSquare className="w-4 h-4" />, cor: "bg-emerald-900/30 text-emerald-300 border-emerald-800" },
  tarefa: { label: "Tarefa", icon: <CheckSquare className="w-4 h-4" />, cor: "bg-yellow-900/30 text-yellow-300 border-yellow-800" },
  linkedin: { label: "LinkedIn", icon: <MessageSquare className="w-4 h-4" />, cor: "bg-indigo-900/30 text-indigo-300 border-indigo-800" },
};

const GATILHOS = [
  "Novo lead qualificado",
  "Deal parado há 7+ dias",
  "Pós-proposta sem resposta",
  "Pós-diagnóstico",
  "Reengajamento de lead frio",
  "Onboarding de novo cliente",
  "Renovação próxima (30 dias)",
  "Upsell/Cross-sell identificado",
];

const INITIAL_CADENCIAS: Cadencia[] = [
  {
    id: "1",
    nome: "Prospecção Outbound - ICP Tier 1",
    descricao: "Cadência de 14 dias para prospecção ativa de leads que se encaixam no ICP principal. Foco em gerar agendamento de diagnóstico.",
    gatilho: "Novo lead qualificado",
    ativa: true,
    totalContatos: 45,
    taxaResposta: 23,
    steps: [
      { id: "1a", dia: 1, tipo: "email", titulo: "Email de abertura personalizado", descricao: "Email curto mencionando dor específica do segmento. Usar template 'Abertura ICP Tier 1'." },
      { id: "1b", dia: 1, tipo: "linkedin", titulo: "Conexão no LinkedIn", descricao: "Enviar convite de conexão com nota personalizada mencionando o email." },
      { id: "1c", dia: 3, tipo: "ligacao", titulo: "Primeira ligação", descricao: "Ligação de 2min. Objetivo: confirmar recebimento do email e gerar interesse." },
      { id: "1d", dia: 4, tipo: "whatsapp", titulo: "WhatsApp de follow-up", descricao: "Mensagem curta: 'Vi que não conseguimos falar. Posso te ligar amanhã às X?'" },
      { id: "1e", dia: 7, tipo: "email", titulo: "Email de valor (case study)", descricao: "Enviar case de sucesso relevante para o segmento do lead." },
      { id: "1f", dia: 9, tipo: "ligacao", titulo: "Segunda ligação", descricao: "Tentar contato novamente. Se não atender, deixar voicemail." },
      { id: "1g", dia: 11, tipo: "email", titulo: "Email de breakup", descricao: "Email final: 'Entendo que o timing pode não ser ideal. Fico à disposição quando fizer sentido.'" },
      { id: "1h", dia: 14, tipo: "tarefa", titulo: "Avaliar resultado da cadência", descricao: "Revisar se houve engajamento. Se sim, mover para próxima etapa. Se não, marcar para reengajamento em 60 dias." },
    ],
  },
  {
    id: "2",
    nome: "Follow-up Pós-Proposta",
    descricao: "Cadência de 10 dias para acompanhar propostas enviadas que ainda não tiveram resposta do decisor.",
    gatilho: "Pós-proposta sem resposta",
    ativa: true,
    totalContatos: 12,
    taxaResposta: 58,
    steps: [
      { id: "2a", dia: 1, tipo: "email", titulo: "Email de acompanhamento", descricao: "Perguntar se a proposta foi recebida e se há dúvidas." },
      { id: "2b", dia: 3, tipo: "ligacao", titulo: "Ligação de follow-up", descricao: "Ligar para o decisor. Objetivo: entender objeções e timeline." },
      { id: "2c", dia: 5, tipo: "whatsapp", titulo: "WhatsApp com resumo", descricao: "Enviar resumo dos principais benefícios da proposta." },
      { id: "2d", dia: 7, tipo: "email", titulo: "Email com novo argumento", descricao: "Enviar ROI calculado ou depoimento de cliente similar." },
      { id: "2e", dia: 10, tipo: "tarefa", titulo: "Decisão sobre o deal", descricao: "Avaliar: avançar para negociação, renegociar, ou marcar como perdido." },
    ],
  },
  {
    id: "3",
    nome: "Reengajamento de Leads Frios",
    descricao: "Cadência de 21 dias para reativar leads que não responderam há mais de 60 dias.",
    gatilho: "Reengajamento de lead frio",
    ativa: false,
    totalContatos: 78,
    taxaResposta: 8,
    steps: [
      { id: "3a", dia: 1, tipo: "email", titulo: "Email de reconexão", descricao: "Email mencionando novidade relevante (produto novo, case, evento)." },
      { id: "3b", dia: 7, tipo: "linkedin", titulo: "Interação no LinkedIn", descricao: "Curtir/comentar post recente do lead. Enviar mensagem se conectado." },
      { id: "3c", dia: 14, tipo: "email", titulo: "Email com conteúdo de valor", descricao: "Enviar artigo, webinar ou material educativo relevante." },
      { id: "3d", dia: 21, tipo: "tarefa", titulo: "Avaliar engajamento", descricao: "Se abriu emails ou respondeu: requalificar. Se não: arquivar." },
    ],
  },
];

export default function ConfigCadencias() {
  const [cadencias, setCadencias] = useState<Cadencia[]>(INITIAL_CADENCIAS);
  const [expandedCadencia, setExpandedCadencia] = useState<string | null>("1");
  const [showForm, setShowForm] = useState(false);
  const [editingCadencia, setEditingCadencia] = useState<Cadencia | null>(null);
  const [showStepForm, setShowStepForm] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<{ cadenciaId: string; step: CadenciaStep } | null>(null);

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    gatilho: GATILHOS[0],
  });

  const [stepForm, setStepForm] = useState({
    dia: 1,
    tipo: "email" as CadenciaStep["tipo"],
    titulo: "",
    descricao: "",
  });

  const totalAtivas = cadencias.filter((c) => c.ativa).length;
  const totalSteps = cadencias.reduce((acc, c) => acc + c.steps.length, 0);

  const openForm = (cadencia?: Cadencia) => {
    if (cadencia) {
      setForm({ nome: cadencia.nome, descricao: cadencia.descricao, gatilho: cadencia.gatilho });
      setEditingCadencia(cadencia);
    } else {
      setForm({ nome: "", descricao: "", gatilho: GATILHOS[0] });
      setEditingCadencia(null);
    }
    setShowForm(true);
  };

  const handleSaveCadencia = () => {
    if (!form.nome.trim()) {
      toast.error("Nome da cadência é obrigatório");
      return;
    }
    if (editingCadencia) {
      setCadencias(cadencias.map((c) =>
        c.id === editingCadencia.id ? { ...c, nome: form.nome, descricao: form.descricao, gatilho: form.gatilho } : c
      ));
      toast.success("Cadência atualizada!");
    } else {
      const newCad: Cadencia = {
        id: Date.now().toString(),
        nome: form.nome,
        descricao: form.descricao,
        gatilho: form.gatilho,
        ativa: true,
        steps: [],
        totalContatos: 0,
        taxaResposta: 0,
      };
      setCadencias([...cadencias, newCad]);
      setExpandedCadencia(newCad.id);
      toast.success("Cadência criada!");
    }
    setShowForm(false);
  };

  const handleDeleteCadencia = (id: string) => {
    setCadencias(cadencias.filter((c) => c.id !== id));
    toast.success("Cadência excluída");
  };

  const handleToggleCadencia = (id: string) => {
    setCadencias(cadencias.map((c) => c.id === id ? { ...c, ativa: !c.ativa } : c));
  };

  const handleDuplicateCadencia = (id: string) => {
    const source = cadencias.find((c) => c.id === id);
    if (!source) return;
    const newCad: Cadencia = {
      ...source,
      id: Date.now().toString(),
      nome: `${source.nome} (Cópia)`,
      totalContatos: 0,
      taxaResposta: 0,
      steps: source.steps.map((s) => ({ ...s, id: `${s.id}-copy-${Date.now()}` })),
    };
    setCadencias([...cadencias, newCad]);
    toast.success("Cadência duplicada!");
  };

  const openStepForm = (cadenciaId: string, step?: CadenciaStep) => {
    if (step) {
      setStepForm({ dia: step.dia, tipo: step.tipo, titulo: step.titulo, descricao: step.descricao });
      setEditingStep({ cadenciaId, step });
    } else {
      const cad = cadencias.find((c) => c.id === cadenciaId);
      const maxDia = cad ? Math.max(0, ...cad.steps.map((s) => s.dia)) : 0;
      setStepForm({ dia: maxDia + 2, tipo: "email", titulo: "", descricao: "" });
      setShowStepForm(cadenciaId);
    }
  };

  const handleSaveStep = () => {
    if (!stepForm.titulo.trim()) {
      toast.error("Título do step é obrigatório");
      return;
    }
    const targetId = editingStep?.cadenciaId || showStepForm;
    setCadencias(cadencias.map((c) => {
      if (c.id !== targetId) return c;
      if (editingStep) {
        return {
          ...c,
          steps: c.steps.map((s) =>
            s.id === editingStep.step.id ? { ...s, dia: stepForm.dia, tipo: stepForm.tipo, titulo: stepForm.titulo, descricao: stepForm.descricao } : s
          ).sort((a, b) => a.dia - b.dia),
        };
      } else {
        return {
          ...c,
          steps: [...c.steps, { id: Date.now().toString(), dia: stepForm.dia, tipo: stepForm.tipo, titulo: stepForm.titulo, descricao: stepForm.descricao }]
            .sort((a, b) => a.dia - b.dia),
        };
      }
    }));
    setEditingStep(null);
    setShowStepForm(null);
    toast.success(editingStep ? "Step atualizado!" : "Step adicionado!");
  };

  const handleDeleteStep = (cadenciaId: string, stepId: string) => {
    setCadencias(cadencias.map((c) => {
      if (c.id !== cadenciaId) return c;
      return { ...c, steps: c.steps.filter((s) => s.id !== stepId) };
    }));
    toast.success("Step removido");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Zap className="w-7 h-7 text-purple-400" />
            <h1 className="text-2xl font-bold">Cadências de Vendas</h1>
          </div>
          <p className="text-gray-400 mt-1 ml-10">
            Configure sequências de follow-up automatizadas para cada etapa do processo comercial
          </p>
        </div>
        <Button onClick={() => openForm()} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Nova Cadência
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{cadencias.length}</p>
            <p className="text-xs text-gray-400">Cadências criadas</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{totalAtivas}</p>
            <p className="text-xs text-gray-400">Ativas</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{totalSteps}</p>
            <p className="text-xs text-gray-400">Steps totais</p>
          </CardContent>
        </Card>
      </div>

      {/* Cadências List */}
      <div className="space-y-4">
        {cadencias.map((cadencia) => {
          const isExpanded = expandedCadencia === cadencia.id;
          const duracao = cadencia.steps.length > 0 ? Math.max(...cadencia.steps.map((s) => s.dia)) : 0;

          return (
            <Card key={cadencia.id} className={`border-gray-700 overflow-hidden ${cadencia.ativa ? "bg-gray-800" : "bg-gray-800/50"}`}>
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-750"
                onClick={() => setExpandedCadencia(isExpanded ? null : cadencia.id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{cadencia.nome}</h3>
                      {cadencia.ativa ? (
                        <Badge className="bg-green-900/30 text-green-300 text-xs">Ativa</Badge>
                      ) : (
                        <Badge className="bg-gray-600/50 text-gray-400 text-xs">Inativa</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">Gatilho: {cadencia.gatilho}</span>
                      <span className="text-xs text-gray-500">·</span>
                      <span className="text-xs text-gray-500">{cadencia.steps.length} steps</span>
                      <span className="text-xs text-gray-500">·</span>
                      <span className="text-xs text-gray-500">{duracao} dias</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <div className="text-right text-xs text-gray-400">
                    <p>{cadencia.totalContatos} contatos</p>
                    <p className="text-green-400">{cadencia.taxaResposta}% resposta</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicateCadencia(cadencia.id)} className="text-gray-400 hover:text-white" title="Duplicar">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Switch checked={cadencia.ativa} onCheckedChange={() => handleToggleCadencia(cadencia.id)} />
                  <Button variant="ghost" size="sm" onClick={() => openForm(cadencia)} className="text-blue-400 hover:text-blue-300">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCadencia(cadencia.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded: Timeline */}
              {isExpanded && (
                <div className="border-t border-gray-700 p-4">
                  <p className="text-sm text-gray-300 mb-4">{cadencia.descricao}</p>

                  {/* Timeline */}
                  <div className="space-y-0">
                    {cadencia.steps.map((step, idx) => {
                      const config = TIPO_STEP_CONFIG[step.tipo];
                      return (
                        <div key={step.id} className="flex gap-4">
                          {/* Timeline Line */}
                          <div className="flex flex-col items-center w-16 flex-shrink-0">
                            <div className="text-xs font-bold text-gray-300 bg-gray-700 px-2 py-1 rounded mb-1">
                              Dia {step.dia}
                            </div>
                            {idx < cadencia.steps.length - 1 && (
                              <div className="flex-1 w-px bg-gray-600 min-h-[20px]" />
                            )}
                          </div>

                          {/* Step Card */}
                          <div className={`flex-1 mb-3 p-3 rounded-lg border ${config.cor} bg-opacity-20`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {config.icon}
                                <Badge className={`text-xs ${config.cor}`}>{config.label}</Badge>
                                <span className="font-medium text-sm">{step.titulo}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => openStepForm(cadencia.id, step)} className="text-blue-400 hover:text-blue-300 h-6 w-6 p-0">
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteStep(cadencia.id, step.id)} className="text-red-400 hover:text-red-300 h-6 w-6 p-0">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{step.descricao}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Step */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openStepForm(cadencia.id)}
                    className="mt-2 border-gray-600 border-dashed w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Step
                  </Button>

                  {cadencia.steps.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>Nenhum step configurado</p>
                      <p className="text-xs mt-1">Adicione o primeiro step para definir a sequência</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Cadência Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCadencia ? "Editar Cadência" : "Nova Cadência"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-gray-300">Nome *</label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Prospecção Outbound - ICP Tier 1"
                className="mt-1 bg-gray-700 border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Descrição</label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descreva o objetivo e contexto desta cadência..."
                className="mt-1 bg-gray-700 border-gray-600"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Gatilho</label>
              <select
                value={form.gatilho}
                onChange={(e) => setForm({ ...form, gatilho: e.target.value })}
                className="mt-1 w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-sm text-white"
              >
                {GATILHOS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-gray-700">
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-gray-600">Cancelar</Button>
              <Button onClick={handleSaveCadencia} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                {editingCadencia ? "Salvar Alterações" : "Criar Cadência"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step Form Dialog */}
      <Dialog
        open={!!showStepForm || !!editingStep}
        onOpenChange={() => { setShowStepForm(null); setEditingStep(null); }}
      >
        <DialogContent className="bg-gray-800 border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStep ? "Editar Step" : "Novo Step"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Dia</label>
                <Input
                  type="number"
                  min={1}
                  value={stepForm.dia}
                  onChange={(e) => setStepForm({ ...stepForm, dia: parseInt(e.target.value) || 1 })}
                  className="mt-1 bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Tipo de Ação</label>
                <select
                  value={stepForm.tipo}
                  onChange={(e) => setStepForm({ ...stepForm, tipo: e.target.value as CadenciaStep["tipo"] })}
                  className="mt-1 w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-sm text-white"
                >
                  {Object.entries(TIPO_STEP_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Título *</label>
              <Input
                value={stepForm.titulo}
                onChange={(e) => setStepForm({ ...stepForm, titulo: e.target.value })}
                placeholder="Ex: Email de abertura personalizado"
                className="mt-1 bg-gray-700 border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Descrição / Instruções</label>
              <Textarea
                value={stepForm.descricao}
                onChange={(e) => setStepForm({ ...stepForm, descricao: e.target.value })}
                placeholder="Descreva o que o vendedor deve fazer neste step..."
                className="mt-1 bg-gray-700 border-gray-600"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-gray-700">
              <Button variant="outline" onClick={() => { setShowStepForm(null); setEditingStep(null); }} className="border-gray-600">Cancelar</Button>
              <Button onClick={handleSaveStep} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                {editingStep ? "Salvar" : "Adicionar Step"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
