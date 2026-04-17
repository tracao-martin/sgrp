import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ChevronDown, ChevronUp, Pencil, Trash2, Plus, GripVertical } from "lucide-react";

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
  const reasonsQuery = trpc.crm.disqualifyReasons.list.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const createCadence = trpc.crm.cadences.create.useMutation({
    onSuccess: () => { utils.crm.cadences.list.invalidate(); toast.success("Cadência criada!"); setNewCadenceName(""); },
    onError: () => toast.error("Erro ao criar cadência"),
  });
  const updateCadence = trpc.crm.cadences.update.useMutation({
    onSuccess: () => utils.crm.cadences.list.invalidate(),
    onError: () => toast.error("Erro ao atualizar"),
  });
  const deleteCadence = trpc.crm.cadences.delete.useMutation({
    onSuccess: () => { utils.crm.cadences.list.invalidate(); toast.success("Cadência excluída"); },
    onError: () => toast.error("Erro ao excluir cadência"),
  });

  const createReason = trpc.crm.disqualifyReasons.create.useMutation({
    onSuccess: () => { utils.crm.disqualifyReasons.list.invalidate(); toast.success("Motivo adicionado!"); setNewReasonName(""); },
    onError: () => toast.error("Erro ao adicionar motivo"),
  });
  const updateReason = trpc.crm.disqualifyReasons.delete.useMutation({
    onSuccess: () => { utils.crm.disqualifyReasons.list.invalidate(); toast.success("Motivo removido"); },
    onError: () => toast.error("Erro ao remover motivo"),
  });

  // Quick create cadence
  const [newCadenceName, setNewCadenceName] = useState("");

  // Per-cadence stage management
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [localStages, setLocalStages] = useState<Stage[]>([]);
  const [stageInput, setStageInput] = useState("");
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  // Edit cadence name dialog
  const [editDialog, setEditDialog] = useState<{ id: number; nome: string } | null>(null);

  // Reasons
  const [newReasonName, setNewReasonName] = useState("");
  const [editReasonDialog, setEditReasonDialog] = useState<{ id: number; nome: string } | null>(null);

  const handleCreateCadence = () => {
    if (!newCadenceName.trim()) { toast.error("Digite um nome"); return; }
    createCadence.mutate({ nome: newCadenceName.trim(), stages: "[]" });
  };

  const handleExpand = (cadence: any) => {
    if (expandedId === cadence.id) {
      setExpandedId(null);
      setLocalStages([]);
      setStageInput("");
      setEditingStage(null);
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
  };

  const handleDeleteStage = (cadenceId: number, stageId: string) => {
    const newStages = localStages.filter((s) => s.id !== stageId);
    setLocalStages(newStages);
    persistStages(cadenceId, newStages);
  };

  const handleSaveStageRename = (cadenceId: number) => {
    if (!editingStage?.name.trim()) return;
    const newStages = localStages.map((s) =>
      s.id === editingStage.id ? { ...s, name: editingStage.name.trim() } : s
    );
    setLocalStages(newStages);
    setEditingStage(null);
    persistStages(cadenceId, newStages);
  };

  const cadences = cadencesQuery.data || [];
  const reasons = reasonsQuery.data || [];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Cadências</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure cadências de prospecção com fases sequenciais
        </p>
      </div>

      {/* Quick Create */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-sm font-medium mb-3">Nova Cadência</p>
        <div className="flex gap-3">
          <Input
            value={newCadenceName}
            onChange={(e) => setNewCadenceName(e.target.value)}
            placeholder="Nome da cadência (ex: Cadência Inbound)..."
            className="bg-background border-border"
            onKeyDown={(e) => { if (e.key === "Enter") handleCreateCadence(); }}
          />
          <Button
            onClick={handleCreateCadence}
            disabled={createCadence.isPending}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            Criar
          </Button>
        </div>
      </div>

      {/* Cadences List */}
      <div className="space-y-3">
        {cadencesQuery.isLoading && (
          <p className="text-sm text-muted-foreground text-center py-6">Carregando...</p>
        )}
        {!cadencesQuery.isLoading && cadences.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma cadência criada ainda.
          </p>
        )}
        {cadences.map((cadence) => {
          const stages = expandedId === cadence.id ? localStages : parseStages(cadence.stages);
          const isExpanded = expandedId === cadence.id;

          return (
            <div key={cadence.id} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Cadence header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{cadence.nome}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stages.length} fase{stages.length !== 1 ? "s" : ""}
                    </p>
                    {stages.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {stages.map((stage, idx) => (
                          <span
                            key={stage.id}
                            className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs rounded-full px-2.5 py-0.5"
                          >
                            <span className="font-bold">{idx + 1}</span>
                            {stage.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-white"
                      onClick={() => setEditDialog({ id: cadence.id, nome: cadence.nome })}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-white border border-border rounded-lg px-3 gap-1"
                      onClick={() => handleExpand(cadence)}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Gerenciar Fases
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => deleteCadence.mutate({ id: cadence.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stages panel */}
              {isExpanded && (
                <div className="border-t border-border bg-background/40 p-5 space-y-3">
                  {localStages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Nenhuma fase cadastrada. Adicione abaixo.
                    </p>
                  )}
                  <div className="space-y-1.5">
                    {localStages.map((stage, idx) => (
                      <div
                        key={stage.id}
                        className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-xs font-bold text-yellow-500 w-5 shrink-0">{idx + 1}</span>
                        {editingStage?.id === stage.id ? (
                          <>
                            <Input
                              value={editingStage.name}
                              onChange={(e) => setEditingStage({ ...editingStage, name: e.target.value })}
                              className="h-7 text-sm bg-background border-border flex-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveStageRename(cadence.id);
                                if (e.key === "Escape") setEditingStage(null);
                              }}
                            />
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-yellow-500 hover:bg-yellow-600 text-black shrink-0"
                              onClick={() => handleSaveStageRename(cadence.id)}
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
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-white"
                              onClick={() => setEditingStage(stage)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
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
                      placeholder="Nome da fase (ex: Primeiro Contato)..."
                      className="bg-card border-border text-sm"
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddStage(cadence.id); }}
                    />
                    <Button
                      onClick={() => handleAddStage(cadence.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Fase
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Motivos de Desqualificação / Aposentadoria */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Motivos de Desqualificação / Aposentadoria</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Estes motivos aparecem ao desqualificar ou aposentar um lead
          </p>
        </div>

        <div className="flex gap-3">
          <Input
            value={newReasonName}
            onChange={(e) => setNewReasonName(e.target.value)}
            placeholder="Ex: Sem budget, Não tem perfil, Concorrente..."
            className="bg-card border-border"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newReasonName.trim())
                createReason.mutate({ nome: newReasonName.trim(), tipo: "desqualificacao" });
            }}
          />
          <Button
            onClick={() => {
              if (!newReasonName.trim()) { toast.error("Digite um motivo"); return; }
              createReason.mutate({ nome: newReasonName.trim(), tipo: "desqualificacao" });
            }}
            disabled={createReason.isPending}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Motivo
          </Button>
        </div>

        <div className="space-y-2">
          {reasonsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          )}
          {!reasonsQuery.isLoading && reasons.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum motivo cadastrado.
            </p>
          )}
          {reasons.map((reason) => (
            <div
              key={reason.id}
              className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3"
            >
              <span className="text-sm">{reason.nome}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-white"
                  onClick={() => setEditReasonDialog({ id: reason.id, nome: reason.nome })}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                  onClick={() => updateReason.mutate({ id: reason.id })}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Cadence Name Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Cadência</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              value={editDialog?.nome ?? ""}
              onChange={(e) => setEditDialog(editDialog ? { ...editDialog, nome: e.target.value } : null)}
              className="bg-background border-border"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && editDialog) {
                  updateCadence.mutate(
                    { id: editDialog.id, nome: editDialog.nome },
                    { onSuccess: () => { toast.success("Nome atualizado"); setEditDialog(null); } }
                  );
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" className="border-border" onClick={() => setEditDialog(null)}>
                Cancelar
              </Button>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={() => {
                  if (!editDialog?.nome.trim()) return;
                  updateCadence.mutate(
                    { id: editDialog.id, nome: editDialog.nome },
                    { onSuccess: () => { toast.success("Nome atualizado"); setEditDialog(null); } }
                  );
                }}
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Reason Dialog */}
      <Dialog open={!!editReasonDialog} onOpenChange={() => setEditReasonDialog(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Motivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              value={editReasonDialog?.nome ?? ""}
              onChange={(e) =>
                setEditReasonDialog(editReasonDialog ? { ...editReasonDialog, nome: e.target.value } : null)
              }
              className="bg-background border-border"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Para editar o nome, exclua este motivo e crie um novo.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" className="border-border" onClick={() => setEditReasonDialog(null)}>
                Fechar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (editReasonDialog) {
                    updateReason.mutate({ id: editReasonDialog.id });
                    setEditReasonDialog(null);
                  }
                }}
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
