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
import { trpc } from "@/lib/trpc";
import {
  Plus,
  Zap,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  XCircle,
  Layers,
} from "lucide-react";

interface Stage {
  id: string;
  name: string;
  order: number;
}

function parseStages(json: string | null | undefined): Stage[] {
  try { return JSON.parse(json || "[]"); } catch { return []; }
}

export default function ConfigCadencias() {
  const utils = trpc.useUtils();

  const cadencesQuery = trpc.crm.cadences.list.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const disqQuery = trpc.crm.disqualifyReasons.list.useQuery(
    { tipo: "desqualificacao" },
    { staleTime: 30_000, refetchOnWindowFocus: false }
  );
  const apoQuery = trpc.crm.disqualifyReasons.list.useQuery(
    { tipo: "aposentamento" },
    { staleTime: 30_000, refetchOnWindowFocus: false }
  );

  const createCadence = trpc.crm.cadences.create.useMutation({
    onSuccess: () => {
      utils.crm.cadences.list.invalidate();
      toast.success("Cadência criada!");
      setShowCadenceForm(false);
    },
    onError: () => toast.error("Erro ao criar cadência"),
  });
  const updateCadence = trpc.crm.cadences.update.useMutation({
    onSuccess: () => {
      utils.crm.cadences.list.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar cadência"),
  });
  const deleteCadence = trpc.crm.cadences.delete.useMutation({
    onSuccess: () => {
      utils.crm.cadences.list.invalidate();
      toast.success("Cadência excluída");
    },
    onError: () => toast.error("Erro ao excluir cadência"),
  });

  const createReason = trpc.crm.disqualifyReasons.create.useMutation({
    onSuccess: () => {
      utils.crm.disqualifyReasons.list.invalidate();
      toast.success("Motivo adicionado!");
      setNewReasonText("");
      setAddingReasonTipo(null);
    },
    onError: () => toast.error("Erro ao adicionar motivo"),
  });
  const deleteReason = trpc.crm.disqualifyReasons.delete.useMutation({
    onSuccess: () => {
      utils.crm.disqualifyReasons.list.invalidate();
      toast.success("Motivo removido");
    },
    onError: () => toast.error("Erro ao remover motivo"),
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [localStages, setLocalStages] = useState<Stage[]>([]);
  const [stageInput, setStageInput] = useState("");
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  const [showCadenceForm, setShowCadenceForm] = useState(false);
  const [editingCadence, setEditingCadence] = useState<any | null>(null);
  const [cadenceForm, setCadenceForm] = useState({ nome: "", descricao: "" });

  const [newReasonText, setNewReasonText] = useState("");
  const [addingReasonTipo, setAddingReasonTipo] = useState<"desqualificacao" | "aposentamento" | null>(null);

  const openCadenceForm = (cadence?: any) => {
    if (cadence) {
      setCadenceForm({ nome: cadence.nome, descricao: cadence.descricao || "" });
      setEditingCadence(cadence);
    } else {
      setCadenceForm({ nome: "", descricao: "" });
      setEditingCadence(null);
    }
    setShowCadenceForm(true);
  };

  const handleSaveCadence = () => {
    if (!cadenceForm.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    if (editingCadence) {
      updateCadence.mutate(
        { id: editingCadence.id, nome: cadenceForm.nome, descricao: cadenceForm.descricao },
        { onSuccess: () => { toast.success("Cadência atualizada!"); setShowCadenceForm(false); } }
      );
    } else {
      createCadence.mutate({ nome: cadenceForm.nome, descricao: cadenceForm.descricao, stages: "[]" });
    }
  };

  const handleExpand = (cadence: any) => {
    if (expandedId === cadence.id) {
      setExpandedId(null);
      setLocalStages([]);
    } else {
      setExpandedId(cadence.id);
      setLocalStages(parseStages(cadence.stages));
      setStageInput("");
      setEditingStage(null);
    }
  };

  const persistStages = (cadenceId: number, stages: Stage[]) => {
    const ordered = stages.map((s, i) => ({ ...s, order: i + 1 }));
    updateCadence.mutate({ id: cadenceId, stages: JSON.stringify(ordered) });
  };

  const handleAddStage = (cadenceId: number) => {
    if (!stageInput.trim()) return;
    const newStages: Stage[] = [
      ...localStages,
      { id: Date.now().toString(), name: stageInput.trim(), order: localStages.length + 1 },
    ];
    setLocalStages(newStages);
    setStageInput("");
    persistStages(cadenceId, newStages);
    toast.success("Etapa adicionada");
  };

  const handleDeleteStage = (cadenceId: number, stageId: string) => {
    const newStages = localStages.filter((s) => s.id !== stageId);
    setLocalStages(newStages);
    persistStages(cadenceId, newStages);
    toast.success("Etapa removida");
  };

  const handleRenameStage = (cadenceId: number) => {
    if (!editingStage || !editingStage.name.trim()) return;
    const newStages = localStages.map((s) =>
      s.id === editingStage.id ? { ...s, name: editingStage.name.trim() } : s
    );
    setLocalStages(newStages);
    setEditingStage(null);
    persistStages(cadenceId, newStages);
    toast.success("Etapa renomeada");
  };

  const handleAddReason = (tipo: "desqualificacao" | "aposentamento") => {
    if (!newReasonText.trim()) return;
    createReason.mutate({ nome: newReasonText.trim(), tipo });
  };

  const cadences = cadencesQuery.data || [];
  const disqReasons = disqQuery.data || [];
  const apoReasons = apoQuery.data || [];
  const totalAtivas = cadences.filter((c) => c.ativa).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Zap className="w-7 h-7 text-purple-400" />
            <h1 className="text-2xl font-bold">Cadências de Vendas</h1>
          </div>
          <p className="text-muted-foreground mt-1 ml-10">
            Configure cadências e etapas para organizar o acompanhamento de leads
          </p>
        </div>
        <Button onClick={() => openCadenceForm()} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Nova Cadência
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{cadences.length}</p>
            <p className="text-xs text-muted-foreground">Cadências criadas</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{totalAtivas}</p>
            <p className="text-xs text-muted-foreground">Ativas</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{disqReasons.length + apoReasons.length}</p>
            <p className="text-xs text-muted-foreground">Motivos cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Cadences List */}
      <div className="space-y-3">
        {cadencesQuery.isLoading && (
          <div className="text-center py-8 text-muted-foreground text-sm">Carregando cadências...</div>
        )}
        {!cadencesQuery.isLoading && cadences.length === 0 && (
          <Card className="bg-card/50 border-border">
            <CardContent className="py-12 text-center">
              <Zap className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">Nenhuma cadência criada</p>
              <p className="text-xs text-muted-foreground mt-1">
                Crie a primeira cadência para organizar o Kanban de leads
              </p>
            </CardContent>
          </Card>
        )}
        {cadences.map((cadence) => {
          const stages = expandedId === cadence.id ? localStages : parseStages(cadence.stages);
          const isExpanded = expandedId === cadence.id;

          return (
            <Card
              key={cadence.id}
              className={`border-border overflow-hidden ${cadence.ativa ? "bg-card" : "bg-card/50"}`}
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5"
                onClick={() => handleExpand(cadence)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded
                    ? <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{cadence.nome}</h3>
                      <Badge
                        className={
                          cadence.ativa
                            ? "bg-green-900/30 text-green-300 text-xs"
                            : "bg-zinc-800 text-muted-foreground text-xs"
                        }
                      >
                        {cadence.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stages.length} etapa{stages.length !== 1 ? "s" : ""}
                      {cadence.descricao ? ` · ${cadence.descricao}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={!!cadence.ativa}
                    onCheckedChange={() =>
                      updateCadence.mutate(
                        { id: cadence.id, ativa: !cadence.ativa },
                        { onSuccess: () => utils.crm.cadences.list.invalidate() }
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openCadenceForm(cadence)}
                    className="text-primary hover:text-primary"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCadence.mutate({ id: cadence.id })}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground/70">
                    Etapas do Kanban
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      (estas colunas aparecerão no board de leads)
                    </span>
                  </p>

                  {localStages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      Nenhuma etapa. Adicione abaixo para criar as colunas do Kanban.
                    </p>
                  )}

                  <div className="space-y-1.5">
                    {localStages.map((stage, idx) => (
                      <div
                        key={stage.id}
                        className="flex items-center gap-2 bg-[#2a2a2a] rounded px-3 py-2"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground w-5">{idx + 1}.</span>
                        {editingStage?.id === stage.id ? (
                          <>
                            <Input
                              value={editingStage.name}
                              onChange={(e) => setEditingStage({ ...editingStage, name: e.target.value })}
                              className="h-7 text-sm bg-[#1a1a1a] border-border flex-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameStage(cadence.id);
                                if (e.key === "Escape") setEditingStage(null);
                              }}
                            />
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-yellow-500 hover:bg-yellow-600 text-black shrink-0"
                              onClick={() => handleRenameStage(cadence.id)}
                            >
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs shrink-0"
                              onClick={() => setEditingStage(null)}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm">{stage.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-primary"
                              onClick={() => setEditingStage(stage)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-400"
                              onClick={() => handleDeleteStage(cadence.id, stage.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Input
                      value={stageInput}
                      onChange={(e) => setStageInput(e.target.value)}
                      placeholder="Nome da nova etapa (ex: Primeiro Contato)..."
                      className="bg-[#2a2a2a] border-border text-sm"
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddStage(cadence.id); }}
                    />
                    <Button
                      onClick={() => handleAddStage(cadence.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Motivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Desqualificação */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Motivos de Desqualificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {disqQuery.isLoading && (
              <p className="text-xs text-muted-foreground">Carregando...</p>
            )}
            {disqReasons.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-[#2a2a2a] rounded px-3 py-2"
              >
                <span className="text-sm">{r.nome}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                  onClick={() => deleteReason.mutate({ id: r.id })}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {!disqQuery.isLoading && disqReasons.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">Nenhum motivo cadastrado</p>
            )}
            <Separator className="my-2" />
            {addingReasonTipo === "desqualificacao" ? (
              <div className="flex gap-2">
                <Input
                  value={newReasonText}
                  onChange={(e) => setNewReasonText(e.target.value)}
                  placeholder="Ex: Sem orçamento no momento..."
                  className="bg-[#2a2a2a] border-border text-sm h-8"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddReason("desqualificacao");
                    if (e.key === "Escape") { setAddingReasonTipo(null); setNewReasonText(""); }
                  }}
                />
                <Button
                  size="sm"
                  className="h-8 bg-yellow-500 hover:bg-yellow-600 text-black shrink-0"
                  onClick={() => handleAddReason("desqualificacao")}
                  disabled={createReason.isPending}
                >
                  Adicionar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 shrink-0"
                  onClick={() => { setAddingReasonTipo(null); setNewReasonText(""); }}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-full border-dashed border-border text-xs"
                onClick={() => setAddingReasonTipo("desqualificacao")}
              >
                <Plus className="w-3 h-3 mr-1" />
                Novo Motivo
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Aposentamento */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Motivos de Aposentadoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {apoQuery.isLoading && (
              <p className="text-xs text-muted-foreground">Carregando...</p>
            )}
            {apoReasons.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-[#2a2a2a] rounded px-3 py-2"
              >
                <span className="text-sm">{r.nome}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                  onClick={() => deleteReason.mutate({ id: r.id })}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {!apoQuery.isLoading && apoReasons.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">Nenhum motivo cadastrado</p>
            )}
            <Separator className="my-2" />
            {addingReasonTipo === "aposentamento" ? (
              <div className="flex gap-2">
                <Input
                  value={newReasonText}
                  onChange={(e) => setNewReasonText(e.target.value)}
                  placeholder="Ex: Cliente comprou concorrente..."
                  className="bg-[#2a2a2a] border-border text-sm h-8"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddReason("aposentamento");
                    if (e.key === "Escape") { setAddingReasonTipo(null); setNewReasonText(""); }
                  }}
                />
                <Button
                  size="sm"
                  className="h-8 bg-yellow-500 hover:bg-yellow-600 text-black shrink-0"
                  onClick={() => handleAddReason("aposentamento")}
                  disabled={createReason.isPending}
                >
                  Adicionar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 shrink-0"
                  onClick={() => { setAddingReasonTipo(null); setNewReasonText(""); }}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-full border-dashed border-border text-xs"
                onClick={() => setAddingReasonTipo("aposentamento")}
              >
                <Plus className="w-3 h-3 mr-1" />
                Novo Motivo
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cadence Form Dialog */}
      <Dialog open={showCadenceForm} onOpenChange={setShowCadenceForm}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCadence ? "Editar Cadência" : "Nova Cadência"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground/80">Nome *</label>
              <Input
                value={cadenceForm.nome}
                onChange={(e) => setCadenceForm({ ...cadenceForm, nome: e.target.value })}
                placeholder="Ex: Cadência para Clientes de Indicação"
                className="mt-1 bg-[#333333] border-border"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveCadence(); }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Descrição</label>
              <Textarea
                value={cadenceForm.descricao}
                onChange={(e) => setCadenceForm({ ...cadenceForm, descricao: e.target.value })}
                placeholder="Descreva o objetivo desta cadência..."
                className="mt-1 bg-[#333333] border-border"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowCadenceForm(false)}
                className="border-border"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveCadence}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                disabled={createCadence.isPending || updateCadence.isPending}
              >
                {editingCadence ? "Salvar Alterações" : "Criar Cadência"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
