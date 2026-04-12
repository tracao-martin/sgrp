import React, { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Building2, Target, DollarSign, Calendar, CheckCircle2, XCircle,
  AlertTriangle, Lightbulb, HelpCircle, TrendingUp, Trophy, Ban,
  Save, RotateCcw, Sparkles
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface DealDetailSheetProps {
  dealId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUALIFICATION_ITEMS = [
  { key: "qualTemBudget" as const, label: "Budget", desc: "O prospect tem orçamento definido?", icon: DollarSign },
  { key: "qualTemAutoridade" as const, label: "Autoridade", desc: "Estamos falando com o decisor?", icon: Target },
  { key: "qualTemNecessidade" as const, label: "Necessidade", desc: "A dor/necessidade foi validada?", icon: AlertTriangle },
  { key: "qualTemTiming" as const, label: "Timing", desc: "Há urgência ou prazo definido?", icon: Calendar },
  { key: "qualTemConcorrente" as const, label: "Concorrência", desc: "Sabemos quem são os concorrentes?", icon: TrendingUp },
  { key: "qualTemProximoPasso" as const, label: "Próximo Passo", desc: "Há um próximo passo claro acordado?", icon: CheckCircle2 },
  { key: "qualTemCriterioDecisao" as const, label: "Critério de Decisão", desc: "Conhecemos os critérios de avaliação?", icon: Lightbulb },
];

export default function DealDetailSheet({ dealId, open, onOpenChange }: DealDetailSheetProps) {
  const [activeTab, setActiveTab] = useState("spin");
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [showLossDialog, setShowLossDialog] = useState(false);
  const [winReason, setWinReason] = useState("");
  const [lossReason, setLossReason] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Form state for SPIN
  const [spinSituacao, setSpinSituacao] = useState("");
  const [spinProblema, setSpinProblema] = useState("");
  const [spinImplicacao, setSpinImplicacao] = useState("");
  const [spinNecessidade, setSpinNecessidade] = useState("");

  // Qualification checkboxes
  const [qualifications, setQualifications] = useState({
    qualTemBudget: false,
    qualTemAutoridade: false,
    qualTemNecessidade: false,
    qualTemTiming: false,
    qualTemConcorrente: false,
    qualTemProximoPasso: false,
    qualTemCriterioDecisao: false,
  });

  // Probability
  const [probabilidadeManual, setProbabilidadeManual] = useState<number | null>(null);
  const [useManualProb, setUseManualProb] = useState(false);

  const { data: deal, isLoading } = trpc.crm.opportunities.getById.useQuery(
    { id: dealId! },
    { enabled: !!dealId && open }
  );
  const { data: stages = [] } = trpc.crm.pipelineStages.list.useQuery();
  const { data: companiesList = [] } = trpc.crm.companies.list.useQuery({});

  const utils = trpc.useUtils();

  const updateDeal = trpc.crm.opportunities.update.useMutation({
    onSuccess: () => {
      utils.crm.opportunities.list.invalidate();
      utils.crm.opportunities.getById.invalidate({ id: dealId! });
      toast.success("Deal atualizado com sucesso!");
      setHasChanges(false);
    },
    onError: (err) => toast.error(err.message),
  });

  // Populate form from deal data
  useEffect(() => {
    if (deal) {
      setSpinSituacao(deal.spinSituacao || "");
      setSpinProblema(deal.spinProblema || "");
      setSpinImplicacao(deal.spinImplicacao || "");
      setSpinNecessidade(deal.spinNecessidade || "");
      setQualifications({
        qualTemBudget: deal.qualTemBudget ?? false,
        qualTemAutoridade: deal.qualTemAutoridade ?? false,
        qualTemNecessidade: deal.qualTemNecessidade ?? false,
        qualTemTiming: deal.qualTemTiming ?? false,
        qualTemConcorrente: deal.qualTemConcorrente ?? false,
        qualTemProximoPasso: deal.qualTemProximoPasso ?? false,
        qualTemCriterioDecisao: deal.qualTemCriterioDecisao ?? false,
      });
      setProbabilidadeManual(deal.probabilidadeManual ?? null);
      setUseManualProb(deal.probabilidadeManual !== null && deal.probabilidadeManual !== undefined);
      setHasChanges(false);
    }
  }, [deal]);

  // Qualification score
  const qualScore = useMemo(() => {
    return Object.values(qualifications).filter(Boolean).length;
  }, [qualifications]);

  const qualPercent = Math.round((qualScore / 7) * 100);

  // Current stage info
  const currentStage = useMemo(() => {
    if (!deal) return null;
    return stages.find((s: any) => s.id === deal.stage_id);
  }, [deal, stages]);

  const company = useMemo(() => {
    if (!deal) return null;
    return companiesList.find((c: any) => c.id === deal.company_id);
  }, [deal, companiesList]);

  const effectiveProbability = useMemo(() => {
    if (useManualProb && probabilidadeManual !== null) return probabilidadeManual;
    return deal?.probabilidadeAuto ?? deal?.probabilidade ?? 0;
  }, [useManualProb, probabilidadeManual, deal]);

  const handleSaveSpin = () => {
    if (!dealId) return;
    updateDeal.mutate({
      id: dealId,
      spinSituacao: spinSituacao || null,
      spinProblema: spinProblema || null,
      spinImplicacao: spinImplicacao || null,
      spinNecessidade: spinNecessidade || null,
    });
  };

  const handleSaveQualification = () => {
    if (!dealId) return;
    updateDeal.mutate({
      id: dealId,
      ...qualifications,
    });
  };

  const handleSaveProbability = () => {
    if (!dealId) return;
    updateDeal.mutate({
      id: dealId,
      probabilidadeManual: useManualProb ? (probabilidadeManual ?? 0) : null,
    });
  };

  const handleMarkAsWon = () => {
    if (!dealId || !winReason.trim()) {
      toast.error("Informe o motivo do ganho");
      return;
    }
    updateDeal.mutate({
      id: dealId,
      status: "ganha",
      motivo_ganho: winReason,
      probabilidadeManual: 100,
    }, {
      onSuccess: () => {
        setShowWinDialog(false);
        setWinReason("");
        onOpenChange(false);
      },
    });
  };

  const handleMarkAsLost = () => {
    if (!dealId || !lossReason.trim()) {
      toast.error("Informe o motivo da perda");
      return;
    }
    updateDeal.mutate({
      id: dealId,
      status: "perdida",
      motivo_perda: lossReason,
      probabilidadeManual: 0,
    }, {
      onSuccess: () => {
        setShowLossDialog(false);
        setLossReason("");
        onOpenChange(false);
      },
    });
  };

  const handleReopenDeal = () => {
    if (!dealId) return;
    updateDeal.mutate({
      id: dealId,
      status: "aberta",
      motivo_ganho: "",
      motivo_perda: "",
    });
  };

  if (!dealId) return null;

  const isClosed = deal?.status === "ganha" || deal?.status === "perdida";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-[600px] bg-[#1c1c1c] border-border overflow-y-auto" side="right">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : deal ? (
            <div className="space-y-5 pb-6">
              <SheetHeader>
                <SheetTitle className="text-xl text-white flex items-center gap-2">
                  {deal.titulo}
                  {deal.status === "ganha" && <Badge className="bg-green-600 text-white">Ganha</Badge>}
                  {deal.status === "perdida" && <Badge className="bg-red-600 text-white">Perdida</Badge>}
                  {deal.status === "aberta" && <Badge className="bg-primary text-primary-foreground">Aberta</Badge>}
                </SheetTitle>
              </SheetHeader>

              {/* Deal Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Building2 className="w-3 h-3" /> Empresa
                  </div>
                  <p className="text-sm font-medium text-white">{company?.nome || "—"}</p>
                </div>
                <div className="bg-card rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <DollarSign className="w-3 h-3" /> Valor
                  </div>
                  <p className="text-sm font-medium text-white">
                    R$ {parseFloat(deal.valor || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-card rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Target className="w-3 h-3" /> Estágio
                  </div>
                  <p className="text-sm font-medium text-white">{currentStage?.nome || "—"}</p>
                </div>
                <div className="bg-card rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <TrendingUp className="w-3 h-3" /> Probabilidade
                  </div>
                  <p className="text-sm font-medium text-white">
                    {effectiveProbability}%
                    {useManualProb && <span className="text-xs text-amber-400 ml-1">(manual)</span>}
                  </p>
                </div>
              </div>

              {/* Qualification Score Bar */}
              <div className="bg-card rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Qualificação</span>
                  <span className="text-xs font-medium text-white">{qualScore}/7 ({qualPercent}%)</span>
                </div>
                <Progress value={qualPercent} className="h-2" />
              </div>

              {/* Action Buttons */}
              {deal.status === "aberta" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowWinDialog(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Trophy className="w-4 h-4 mr-2" /> Marcar como Ganha
                  </Button>
                  <Button
                    onClick={() => setShowLossDialog(true)}
                    variant="outline"
                    className="flex-1 border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Ban className="w-4 h-4 mr-2" /> Marcar como Perdida
                  </Button>
                </div>
              )}

              {isClosed && (
                <div className="space-y-2">
                  {deal.status === "ganha" && deal.motivo_ganho && (
                    <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
                      <p className="text-xs text-green-400 mb-1">Motivo do Ganho</p>
                      <p className="text-sm text-white">{deal.motivo_ganho}</p>
                    </div>
                  )}
                  {deal.status === "perdida" && deal.motivo_perda && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                      <p className="text-xs text-red-400 mb-1">Motivo da Perda</p>
                      <p className="text-sm text-white">{deal.motivo_perda}</p>
                    </div>
                  )}
                  <Button
                    onClick={handleReopenDeal}
                    variant="outline"
                    className="w-full border-border text-foreground/80"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Reabrir Deal
                  </Button>
                </div>
              )}

              <Separator className="bg-[#333333]" />

              {/* Tabs: SPIN / Qualificação / Probabilidade */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full bg-card border border-border">
                  <TabsTrigger value="spin" className="flex-1 data-[state=active]:bg-primary text-xs">
                    <Sparkles className="w-3 h-3 mr-1" /> SPIN
                  </TabsTrigger>
                  <TabsTrigger value="qualification" className="flex-1 data-[state=active]:bg-primary text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Qualificação
                  </TabsTrigger>
                  <TabsTrigger value="probability" className="flex-1 data-[state=active]:bg-primary text-xs">
                    <Target className="w-3 h-3 mr-1" /> Probabilidade
                  </TabsTrigger>
                </TabsList>

                {/* SPIN Tab */}
                <TabsContent value="spin" className="space-y-4 mt-4">
                  <div className="bg-primary/15 border border-primary/30 rounded-lg p-3">
                    <p className="text-xs text-primary">
                      A metodologia SPIN Selling ajuda a estruturar a descoberta do cliente em 4 dimensões:
                      Situação, Problema, Implicação e Necessidade de Solução.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-amber-400 flex items-center gap-1 mb-1">
                        <HelpCircle className="w-3 h-3" /> S — Situação
                      </Label>
                      <p className="text-xs text-muted-foreground mb-1">Contexto atual do cliente. Como opera hoje?</p>
                      <Textarea
                        value={spinSituacao}
                        onChange={(e) => { setSpinSituacao(e.target.value); setHasChanges(true); }}
                        placeholder="Ex: Empresa usa planilhas para controlar vendas, 15 vendedores..."
                        className="bg-card border-border text-sm min-h-[80px]"
                        disabled={isClosed}
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-red-400 flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3 h-3" /> P — Problema
                      </Label>
                      <p className="text-xs text-muted-foreground mb-1">Quais dores e dificuldades o cliente enfrenta?</p>
                      <Textarea
                        value={spinProblema}
                        onChange={(e) => { setSpinProblema(e.target.value); setHasChanges(true); }}
                        placeholder="Ex: Perdem follow-ups, não têm visibilidade do pipeline..."
                        className="bg-card border-border text-sm min-h-[80px]"
                        disabled={isClosed}
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-orange-400 flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3" /> I — Implicação
                      </Label>
                      <p className="text-xs text-muted-foreground mb-1">Qual o impacto financeiro/operacional do problema?</p>
                      <Textarea
                        value={spinImplicacao}
                        onChange={(e) => { setSpinImplicacao(e.target.value); setHasChanges(true); }}
                        placeholder="Ex: Estimam perder 30% das oportunidades por falta de acompanhamento..."
                        className="bg-card border-border text-sm min-h-[80px]"
                        disabled={isClosed}
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-green-400 flex items-center gap-1 mb-1">
                        <Lightbulb className="w-3 h-3" /> N — Necessidade de Solução
                      </Label>
                      <p className="text-xs text-muted-foreground mb-1">O que o cliente precisa resolver? Qual o cenário ideal?</p>
                      <Textarea
                        value={spinNecessidade}
                        onChange={(e) => { setSpinNecessidade(e.target.value); setHasChanges(true); }}
                        placeholder="Ex: Precisam de um CRM que automatize follow-ups e dê visibilidade..."
                        className="bg-card border-border text-sm min-h-[80px]"
                        disabled={isClosed}
                      />
                    </div>

                    {!isClosed && (
                      <Button
                        onClick={handleSaveSpin}
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={updateDeal.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateDeal.isPending ? "Salvando..." : "Salvar SPIN"}
                      </Button>
                    )}
                  </div>
                </TabsContent>

                {/* Qualification Tab */}
                <TabsContent value="qualification" className="space-y-4 mt-4">
                  <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-3">
                    <p className="text-xs text-purple-300">
                      Marque os critérios de qualificação confirmados. Quanto mais critérios validados,
                      maior a confiança na oportunidade. Meta: 5/7 para considerar bem qualificada.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {QUALIFICATION_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const checked = qualifications[item.key];
                      return (
                        <div
                          key={item.key}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                            checked
                              ? "bg-green-900/20 border-green-700"
                              : "bg-card border-border hover:border-border"
                          }`}
                          onClick={() => {
                            if (isClosed) return;
                            setQualifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                            setHasChanges(true);
                          }}
                        >
                          <Checkbox
                            checked={checked}
                            disabled={isClosed}
                            className="mt-0.5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${checked ? "text-green-400" : "text-muted-foreground"}`} />
                              <span className={`text-sm font-medium ${checked ? "text-green-300" : "text-gray-200"}`}>
                                {item.label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-card rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground/80">Score de Qualificação</span>
                      <span className={`text-lg font-bold ${
                        qualPercent >= 70 ? "text-green-400" : qualPercent >= 40 ? "text-amber-400" : "text-red-400"
                      }`}>
                        {qualScore}/7
                      </span>
                    </div>
                    <Progress value={qualPercent} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {qualPercent >= 70
                        ? "Oportunidade bem qualificada. Avance com confiança."
                        : qualPercent >= 40
                        ? "Qualificação parcial. Investigue os critérios faltantes."
                        : "Qualificação baixa. Priorize a descoberta antes de avançar."}
                    </p>
                  </div>

                  {!isClosed && (
                    <Button
                      onClick={handleSaveQualification}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={updateDeal.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateDeal.isPending ? "Salvando..." : "Salvar Qualificação"}
                    </Button>
                  )}
                </TabsContent>

                {/* Probability Tab */}
                <TabsContent value="probability" className="space-y-4 mt-4">
                  <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-3">
                    <p className="text-xs text-amber-300">
                      A probabilidade é calculada automaticamente pelo estágio do pipeline.
                      Você pode sobrescrever com um valor manual quando necessário.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-card rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-foreground/80">Probabilidade Automática (Estágio)</span>
                        <span className="text-lg font-bold text-primary">
                          {deal?.probabilidadeAuto ?? currentStage?.probabilidade_fechamento ?? 0}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Baseada no estágio "{currentStage?.nome || "—"}" ({currentStage?.probabilidade_fechamento ?? 0}%)
                      </p>
                    </div>

                    <div className={`rounded-lg p-4 border transition-colors ${
                      useManualProb ? "bg-amber-900/20 border-amber-700" : "bg-card border-border"
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={useManualProb}
                            onCheckedChange={(checked) => {
                              setUseManualProb(!!checked);
                              if (!checked) setProbabilidadeManual(null);
                              else setProbabilidadeManual(deal?.probabilidade ?? 50);
                              setHasChanges(true);
                            }}
                            disabled={isClosed}
                          />
                          <span className="text-sm text-foreground/80">Sobrescrever com valor manual</span>
                        </div>
                        {useManualProb && (
                          <span className="text-lg font-bold text-amber-400">{probabilidadeManual ?? 0}%</span>
                        )}
                      </div>

                      {useManualProb && (
                        <div className="space-y-2">
                          <Slider
                            value={[probabilidadeManual ?? 0]}
                            onValueChange={([v]) => { setProbabilidadeManual(v); setHasChanges(true); }}
                            max={100}
                            step={5}
                            disabled={isClosed}
                            className="py-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-card rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-200">Probabilidade Efetiva</span>
                        <span className={`text-2xl font-bold ${
                          effectiveProbability >= 70 ? "text-green-400" : effectiveProbability >= 40 ? "text-amber-400" : "text-red-400"
                        }`}>
                          {effectiveProbability}%
                        </span>
                      </div>
                      <Progress value={effectiveProbability} className="h-2 mt-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Valor ponderado: R$ {(parseFloat(deal?.valor || "0") * effectiveProbability / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {!isClosed && (
                    <Button
                      onClick={handleSaveProbability}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      disabled={updateDeal.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateDeal.isPending ? "Salvando..." : "Salvar Probabilidade"}
                    </Button>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Deal não encontrado
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Win Dialog */}
      <Dialog open={showWinDialog} onOpenChange={setShowWinDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-400">
              <Trophy className="w-5 h-5" /> Marcar Deal como Ganha
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-foreground/80">
              Parabéns! Informe o motivo principal do ganho para análise futura.
            </p>
            <div>
              <Label>Motivo do Ganho *</Label>
              <Textarea
                value={winReason}
                onChange={(e) => setWinReason(e.target.value)}
                placeholder="Ex: Melhor custo-benefício, funcionalidades superiores, relacionamento..."
                className="bg-[#333333] border-border min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWinDialog(false)} className="border-border">
              Cancelar
            </Button>
            <Button
              onClick={handleMarkAsWon}
              className="bg-green-600 hover:bg-green-700"
              disabled={updateDeal.isPending}
            >
              {updateDeal.isPending ? "Salvando..." : "Confirmar Ganho"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loss Dialog */}
      <Dialog open={showLossDialog} onOpenChange={setShowLossDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <XCircle className="w-5 h-5" /> Marcar Deal como Perdida
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-foreground/80">
              Registre o motivo da perda para aprendizado e melhoria contínua.
            </p>
            <div>
              <Label>Motivo da Perda *</Label>
              <Textarea
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
                placeholder="Ex: Preço alto, escolheu concorrente, projeto cancelado, sem budget..."
                className="bg-[#333333] border-border min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLossDialog(false)} className="border-border">
              Cancelar
            </Button>
            <Button
              onClick={handleMarkAsLost}
              className="bg-red-600 hover:bg-red-700"
              disabled={updateDeal.isPending}
            >
              {updateDeal.isPending ? "Salvando..." : "Confirmar Perda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
