import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, Loader, ChevronDown, ChevronUp, Check, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stage {
  id: string;
  name: string;
  order: number;
}

function parseStages(raw: string | null | undefined): Stage[] {
  try { return JSON.parse(raw || "[]"); } catch { return []; }
}

// ─── Stage Pill ───────────────────────────────────────────────────────────────

function StagePill({ order, name }: { order: number; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a2a2a] border border-border text-sm">
      <span className="w-5 h-5 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
        {order}
      </span>
      <span className="text-foreground/80">{name}</span>
    </span>
  );
}

// ─── Manage Phases Panel ──────────────────────────────────────────────────────

function ManageStagesPanel({ cadId, stages, onUpdate }: {
  cadId: number;
  stages: Stage[];
  onUpdate: (stages: Stage[]) => void;
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const save = (updated: Stage[]) => {
    onUpdate(updated);
  };

  const addStage = () => {
    if (!newName.trim()) return;
    const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order)) : 0;
    const newStage: Stage = { id: Date.now().toString(), name: newName.trim(), order: maxOrder + 1 };
    save([...stages, newStage]);
    setNewName("");
  };

  const deleteStage = (id: string) => {
    const filtered = stages.filter(s => s.id !== id);
    const reordered = filtered.map((s, i) => ({ ...s, order: i + 1 }));
    save(reordered);
  };

  const startEdit = (s: Stage) => {
    setEditingId(s.id);
    setEditName(s.name);
  };

  const confirmEdit = () => {
    if (!editName.trim()) return;
    save(stages.map(s => s.id === editingId ? { ...s, name: editName.trim() } : s));
    setEditingId(null);
  };

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-2">
      {/* Existing stages */}
      {stages.map((s) => (
        <div key={s.id} className="flex items-center gap-2 group">
          <span className="w-5 h-5 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
            {s.order}
          </span>
          {editingId === s.id ? (
            <>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") setEditingId(null); }}
                className="h-7 text-sm bg-[#333] border-border flex-1"
                autoFocus
              />
              <button onClick={confirmEdit} className="text-green-400 hover:text-green-300">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm text-foreground/80">{s.name}</span>
              <button onClick={() => startEdit(s)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => deleteStage(s.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ))}

      {/* Add new stage */}
      <div className="flex gap-2 pt-1">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addStage(); }}
          placeholder="Nome da fase..."
          className="h-8 text-sm bg-[#333] border-border"
        />
        <Button size="sm" onClick={addStage} disabled={!newName.trim()} className="h-8 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
          <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
        </Button>
      </div>
    </div>
  );
}

// ─── Cadence Card ─────────────────────────────────────────────────────────────

function CadenceCard({ cad, onUpdate, onDelete }: {
  cad: any;
  onUpdate: (id: number, data: Partial<{ nome: string; stages: string }>) => void;
  onDelete: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(cad.nome);

  const stages = parseStages(cad.stages);

  const confirmName = () => {
    if (!nameValue.trim()) { setNameValue(cad.nome); setEditingName(false); return; }
    onUpdate(cad.id, { nome: nameValue.trim() });
    setEditingName(false);
  };

  const handleStagesUpdate = (updated: Stage[]) => {
    onUpdate(cad.id, { stages: JSON.stringify(updated) });
  };

  return (
    <div className="bg-white dark:bg-[#1e1e1e] border border-border rounded-xl p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") confirmName(); if (e.key === "Escape") { setNameValue(cad.nome); setEditingName(false); } }}
                className="h-7 text-sm font-semibold bg-[#333] border-border"
                autoFocus
              />
              <button onClick={confirmName} className="text-green-400 hover:text-green-300">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => { setNameValue(cad.nome); setEditingName(false); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h3 className="font-semibold text-base">{cad.nome}</h3>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">{stages.length} fase{stages.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!editingName && (
            <button onClick={() => setEditingName(true)} className="p-1.5 rounded hover:bg-[#333] text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm text-foreground/80 hover:bg-[#333] transition-colors"
          >
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Gerenciar Fases
          </button>
          <button onClick={() => onDelete(cad.id)} className="p-1.5 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stage pills */}
      {stages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[...stages].sort((a, b) => a.order - b.order).map(s => (
            <StagePill key={s.id} order={s.order} name={s.name} />
          ))}
        </div>
      )}

      {/* Manage stages panel */}
      {open && (
        <ManageStagesPanel
          cadId={cad.id}
          stages={[...stages].sort((a, b) => a.order - b.order)}
          onUpdate={handleStagesUpdate}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ConfigCadencias() {
  const utils = trpc.useUtils();

  // Cadences
  const { data: cadencias = [], isLoading: loadingCad } = trpc.crm.cadences.list.useQuery();
  const createCadMutation = trpc.crm.cadences.create.useMutation({
    onSuccess: () => { utils.crm.cadences.list.invalidate(); setNewCadName(""); toast.success("Cadência criada!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const updateCadMutation = trpc.crm.cadences.update.useMutation({
    onSuccess: () => { utils.crm.cadences.list.invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteCadMutation = trpc.crm.cadences.delete.useMutation({
    onSuccess: () => { utils.crm.cadences.list.invalidate(); toast.success("Cadência excluída"); },
    onError: (e: any) => toast.error(e.message),
  });

  // Disqualify reasons
  const { data: reasons = [], isLoading: loadingReasons } = trpc.crm.disqualifyReasons.list.useQuery();
  const createReasonMutation = trpc.crm.disqualifyReasons.create.useMutation({
    onSuccess: () => { utils.crm.disqualifyReasons.list.invalidate(); setNewReason(""); toast.success("Motivo adicionado!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteReasonMutation = trpc.crm.disqualifyReasons.delete.useMutation({
    onSuccess: () => { utils.crm.disqualifyReasons.list.invalidate(); toast.success("Motivo removido"); },
    onError: (e: any) => toast.error(e.message),
  });

  const [newCadName, setNewCadName] = useState("");
  const [newReason, setNewReason] = useState("");
  const [editingReasonId, setEditingReasonId] = useState<number | null>(null);
  const [editingReasonName, setEditingReasonName] = useState("");

  const handleCreateCad = () => {
    if (!newCadName.trim()) return;
    createCadMutation.mutate({ nome: newCadName.trim() });
  };

  const handleUpdateCad = (id: number, data: Partial<{ nome: string; stages: string }>) => {
    updateCadMutation.mutate({ id, ...data });
  };

  const handleAddReason = () => {
    if (!newReason.trim()) return;
    createReasonMutation.mutate({ nome: newReason.trim(), tipo: "desqualificacao" });
  };

  if (loadingCad || loadingReasons) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Cadências</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure cadências de prospecção com fases sequenciais</p>
      </div>

      {/* Nova Cadência */}
      <div className="bg-white dark:bg-[#1e1e1e] border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold mb-3">Nova Cadência</h2>
        <div className="flex gap-2">
          <Input
            value={newCadName}
            onChange={(e) => setNewCadName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreateCad(); }}
            placeholder="Nome da cadência (ex: Cadência Inbound)..."
            className="bg-[#333] border-border"
          />
          <Button
            onClick={handleCreateCad}
            disabled={!newCadName.trim() || createCadMutation.isPending}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold whitespace-nowrap"
          >
            {createCadMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Criar</>}
          </Button>
        </div>
      </div>

      {/* Cadences list */}
      {cadencias.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma cadência criada ainda</p>
      ) : (
        <div className="space-y-3">
          {cadencias.map((cad: any) => (
            <CadenceCard
              key={cad.id}
              cad={cad}
              onUpdate={handleUpdateCad}
              onDelete={(id) => deleteCadMutation.mutate({ id })}
            />
          ))}
        </div>
      )}

      {/* Motivos de Desqualificação */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Motivos de Desqualificação / Aposentadoria</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Estes motivos aparecem ao desqualificar ou aposentar um lead</p>
        </div>

        {/* Add reason */}
        <div className="flex gap-2">
          <Input
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddReason(); }}
            placeholder="Ex: Sem budget, Não tem perfil, Concorrente..."
            className="bg-[#333] border-border"
          />
          <Button
            onClick={handleAddReason}
            disabled={!newReason.trim() || createReasonMutation.isPending}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold whitespace-nowrap"
          >
            {createReasonMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Adicionar Motivo</>}
          </Button>
        </div>

        {/* Reasons list */}
        {reasons.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum motivo cadastrado</p>
        ) : (
          <div className="space-y-2">
            {(reasons as any[]).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between bg-white dark:bg-[#1e1e1e] border border-border rounded-lg px-4 py-3 group">
                {editingReasonId === r.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <Input
                      value={editingReasonName}
                      onChange={(e) => setEditingReasonName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          // No update mutation in disqualifyReasons router — delete + re-create
                          deleteReasonMutation.mutate({ id: r.id });
                          createReasonMutation.mutate({ nome: editingReasonName.trim(), tipo: r.tipo });
                          setEditingReasonId(null);
                        }
                        if (e.key === "Escape") setEditingReasonId(null);
                      }}
                      className="h-7 text-sm bg-[#333] border-border"
                      autoFocus
                    />
                    <button onClick={() => {
                      deleteReasonMutation.mutate({ id: r.id });
                      createReasonMutation.mutate({ nome: editingReasonName.trim(), tipo: r.tipo });
                      setEditingReasonId(null);
                    }} className="text-green-400 hover:text-green-300">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingReasonId(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-foreground/80 flex-1">{r.nome}</span>
                )}
                {editingReasonId !== r.id && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingReasonId(r.id); setEditingReasonName(r.nome); }}
                      className="p-1.5 rounded hover:bg-[#333] text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteReasonMutation.mutate({ id: r.id })}
                      className="p-1.5 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
