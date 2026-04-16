import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, DollarSign, Target, ChevronRight, CheckCircle2, Trophy, Ban, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import DealDetailSheet from "@/components/DealDetailSheet";

export default function FunilVendas() {
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [draggedDeal, setDraggedDeal] = useState<number | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
  const [showDealDetail, setShowDealDetail] = useState(false);

  // Fetch real data
  const { data: stages = [], isLoading: loadingStages } = trpc.crm.pipelineStages.list.useQuery();
  const { data: deals = [], isLoading: loadingDeals } = trpc.crm.opportunities.list.useQuery();
  const { data: companiesList = [] } = trpc.crm.companies.list.useQuery({});
  const { data: contactsList = [] } = trpc.crm.contacts.list.useQuery({});

  const utils = trpc.useUtils();

  // Update stage mutation
  const updateStage = trpc.crm.opportunities.updateStage.useMutation({
    onSuccess: () => {
      utils.crm.opportunities.list.invalidate();
      toast.success("Deal movido com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  // Create deal mutation
  const createDeal = trpc.crm.opportunities.create.useMutation({
    onSuccess: () => {
      utils.crm.opportunities.list.invalidate();
      setShowNewDeal(false);
      toast.success("Deal criado com sucesso!");
      setNewDeal({ titulo: "", descricao: "", valor: "", company_id: "", stage_id: "" });
    },
  });

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    const grouped: Record<number, typeof deals> = {};
    for (const stage of stages) {
      grouped[stage.id] = deals.filter((d: any) => d.stage_id === stage.id && d.status === "aberta");
    }
    return grouped;
  }, [stages, deals]);

  // Calculate summary
  const summary = useMemo(() => {
    const openDeals = deals.filter((d: any) => d.status === "aberta");
    const totalValue = openDeals.reduce((sum: number, d: any) => sum + parseFloat(d.valor || "0"), 0);
    const wonDeals = deals.filter((d: any) => d.status === "ganha");
    const wonValue = wonDeals.reduce((sum: number, d: any) => sum + parseFloat(d.valor || "0"), 0);
    const lostDeals = deals.filter((d: any) => d.status === "perdida");
    const lostValue = lostDeals.reduce((sum: number, d: any) => sum + parseFloat(d.valor || "0"), 0);
    const conversionRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

    // Weighted pipeline value
    const weightedValue = openDeals.reduce((sum: number, d: any) => {
      const prob = d.probabilidadeManual ?? d.probabilidadeAuto ?? d.probabilidade ?? 0;
      return sum + parseFloat(d.valor || "0") * prob / 100;
    }, 0);

    return { total: openDeals.length, totalValue, weightedValue, wonValue, lostValue, conversionRate, wonCount: wonDeals.length, lostCount: lostDeals.length };
  }, [deals]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, dealId: number) => {
    setDraggedDeal(dealId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (stageId: number) => {
    if (draggedDeal !== null) {
      updateStage.mutate({ id: draggedDeal, stage_id: stageId });
      setDraggedDeal(null);
    }
  };

  const handleDealClick = (dealId: number) => {
    setSelectedDealId(dealId);
    setShowDealDetail(true);
  };

  // Stage colors
  const stageColors: Record<number, string> = {};
  stages.forEach((s: any, i: number) => {
    const colors = ["bg-[#555555]", "bg-primary", "bg-purple-500", "bg-amber-500", "bg-emerald-500"];
    stageColors[s.id] = colors[i % colors.length];
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (num >= 1000000) return `R$ ${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `R$ ${(num / 1000).toFixed(0)}K`;
    return `R$ ${num.toLocaleString("pt-BR")}`;
  };

  // Qualification score helper
  const getQualScore = (deal: any) => {
    let score = 0;
    if (deal.qualTemBudget) score++;
    if (deal.qualTemAutoridade) score++;
    if (deal.qualTemNecessidade) score++;
    if (deal.qualTemTiming) score++;
    if (deal.qualTemConcorrente) score++;
    if (deal.qualTemProximoPasso) score++;
    if (deal.qualTemCriterioDecisao) score++;
    return score;
  };

  // New deal form
  const [newDeal, setNewDeal] = useState({
    titulo: "",
    descricao: "",
    valor: "",
    company_id: "",
    contact_id: "",
    stage_id: "",
  });

  // Contacts filtered by selected company
  const filteredContacts = (contactsList as any[]).filter(
    (c: any) => !newDeal.company_id || String(c.company_id) === newDeal.company_id
  );

  const handleCreateDeal = () => {
    if (!newDeal.titulo || !newDeal.company_id || !newDeal.contact_id || !newDeal.stage_id) {
      toast.error("Preencha os campos obrigatórios: Título, Empresa, Contato e Estágio");
      return;
    }
    createDeal.mutate({
      titulo: newDeal.titulo,
      descricao: newDeal.descricao || undefined,
      valor: newDeal.valor || "0",
      company_id: parseInt(newDeal.company_id),
      contact_id: parseInt(newDeal.contact_id),
      stage_id: parseInt(newDeal.stage_id),
    });
  };

  if (loadingStages || loadingDeals) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Funil de Vendas</h1>
          <p className="text-muted-foreground mt-1">Pipeline Kanban — Arraste os deals entre estágios. Clique para abrir detalhes SPIN.</p>
        </div>
        <Dialog open={showNewDeal} onOpenChange={setShowNewDeal}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Novo Deal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={newDeal.titulo}
                  onChange={(e) => setNewDeal({ ...newDeal, titulo: e.target.value })}
                  placeholder="Ex: SoftWave — Licença Pro"
                  className="bg-[#333333] border-border"
                />
              </div>
              <div>
                <Label>Empresa *</Label>
                <Select
                  value={newDeal.company_id}
                  onValueChange={(v) => setNewDeal({ ...newDeal, company_id: v, contact_id: "" })}
                >
                  <SelectTrigger className="bg-[#333333] border-border">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#333333] border-border">
                    {(companiesList as any[]).map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Contato *</Label>
                <Select value={newDeal.contact_id} onValueChange={(v) => setNewDeal({ ...newDeal, contact_id: v })}>
                  <SelectTrigger className="bg-[#333333] border-border">
                    <SelectValue placeholder="Selecione o contato" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#333333] border-border">
                    {filteredContacts.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {newDeal.company_id ? "Nenhum contato nesta empresa" : "Selecione uma empresa primeiro"}
                      </div>
                    ) : (
                      filteredContacts.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nome}{c.cargo ? ` — ${c.cargo}` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estágio *</Label>
                <Select value={newDeal.stage_id} onValueChange={(v) => setNewDeal({ ...newDeal, stage_id: v })}>
                  <SelectTrigger className="bg-[#333333] border-border">
                    <SelectValue placeholder="Selecione o estágio" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#333333] border-border">
                    {stages.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  value={newDeal.valor}
                  onChange={(e) => setNewDeal({ ...newDeal, valor: e.target.value })}
                  placeholder="Ex: 4500.00"
                  className="bg-[#333333] border-border"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={newDeal.descricao}
                  onChange={(e) => setNewDeal({ ...newDeal, descricao: e.target.value })}
                  placeholder="Detalhes do deal..."
                  className="bg-[#333333] border-border"
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateDeal} className="w-full bg-primary hover:bg-primary/90" disabled={createDeal.isPending}>
                {createDeal.isPending ? "Criando..." : "Criar Deal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stage Legend */}
      <div className="flex flex-wrap gap-4">
        {stages.map((stage: any) => (
          <div key={stage.id} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${stageColors[stage.id]}`} />
            <span className="text-sm text-foreground/80">{stage.nome}</span>
            <span className="text-xs text-muted-foreground">({stage.probabilidade_fechamento}%)</span>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage: any) => {
          const stageDeals = dealsByStage[stage.id] || [];
          const stageValue = stageDeals.reduce((sum: number, d: any) => sum + parseFloat(d.valor || "0"), 0);

          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-72"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
            >
              <div className="space-y-3">
                {/* Stage Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stageColors[stage.id]}`} />
                    <h3 className="font-semibold text-gray-200 text-sm">{stage.nome}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatCurrency(stageValue)}</span>
                    <span className="text-xs bg-[#333333] px-2 py-0.5 rounded text-foreground/80">
                      {stageDeals.length}
                    </span>
                  </div>
                </div>

                {/* Stage Column */}
                <div className={`bg-card/50 rounded-lg p-3 min-h-[400px] space-y-3 border-2 border-transparent ${draggedDeal !== null ? "border-dashed border-border" : ""}`}>
                  {stageDeals.map((deal: any) => {
                    const company = (companiesList as any[]).find((c: any) => c.id === deal.company_id);
                    const prob = deal.probabilidadeManual ?? deal.probabilidadeAuto ?? deal.probabilidade ?? 0;
                    const qualScore = getQualScore(deal);
                    const hasManualProb = deal.probabilidadeManual !== null && deal.probabilidadeManual !== undefined;

                    return (
                      <Card
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onClick={() => handleDealClick(deal.id)}
                        className={`cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all active:cursor-grabbing ${
                          deal.em_risco
                            ? "bg-red-950/40 border-red-800/60 hover:border-red-600/60"
                            : "bg-[#333333] border-border hover:border-primary/20"
                        } ${draggedDeal === deal.id ? "opacity-50" : ""}`}
                      >
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <p className="font-medium text-white text-sm leading-tight">{deal.titulo}</p>
                                {deal.em_risco && (
                                  <span title="Sem próximo passo agendado">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Building2 className="w-3 h-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">{company?.nome || "—"}</p>
                              </div>
                            </div>

                            {/* Probability bar */}
                            {prob > 0 && (
                              <div className="w-full bg-[#444444] rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${hasManualProb ? "bg-amber-500" : "bg-primary"}`}
                                  style={{ width: `${prob}%` }}
                                />
                              </div>
                            )}

                            {/* Bottom row: value + indicators */}
                            <div className="flex justify-between items-center pt-2 border-t border-border">
                              <span className="text-xs font-medium text-primary">
                                <DollarSign className="w-3 h-3 inline" />
                                {formatCurrency(deal.valor || "0")}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {/* Qualification indicator */}
                                {qualScore > 0 && (
                                  <Badge variant="outline" className={`text-[10px] px-1 py-0 h-4 ${
                                    qualScore >= 5 ? "border-green-600 text-green-400" : qualScore >= 3 ? "border-amber-600 text-amber-400" : "border-border text-muted-foreground"
                                  }`}>
                                    <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />{qualScore}/7
                                  </Badge>
                                )}
                                {/* Probability */}
                                <span className={`text-xs ${hasManualProb ? "text-amber-400" : "text-muted-foreground"}`}>
                                  {prob}%
                                </span>
                                <Target className="w-3 h-3 text-muted-foreground" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {stageDeals.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <ChevronRight className="w-6 h-6 mb-1" />
                      <p className="text-xs">Nenhum deal</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Deals Abertos</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Valor Pipeline</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Valor Ponderado</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(summary.weightedValue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Taxa Conversão</p>
              <p className="text-2xl font-bold">{summary.conversionRate}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                <Trophy className="w-3 h-3 inline mr-1 text-green-400" />Ganhos
              </p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(summary.wonValue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                <Ban className="w-3 h-3 inline mr-1 text-red-400" />Perdidos
              </p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(summary.lostValue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Detail Sheet */}
      <DealDetailSheet
        dealId={selectedDealId}
        open={showDealDetail}
        onOpenChange={setShowDealDetail}
      />
    </div>
  );
}
