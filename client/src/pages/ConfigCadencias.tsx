import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Plus, Zap, Pencil, Trash2, ChevronDown, ChevronRight,
  Mail, Phone, MessageSquare, CheckSquare, Loader,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CadenciaStep {
  id: string;
  dia: number;
  tipo: "email" | "ligacao" | "whatsapp" | "tarefa" | "linkedin";
  titulo: string;
  descricao: string;
}

const TIPO_CONFIG: Record<string, { label: string; icon: React.ReactNode; cor: string }> = {
  email:    { label: "Email",     icon: <Mail className="w-4 h-4" />,        cor: "bg-primary/20 text-primary border-primary/30" },
  ligacao:  { label: "Ligação",   icon: <Phone className="w-4 h-4" />,       cor: "bg-green-900/30 text-green-300 border-green-800" },
  whatsapp: { label: "WhatsApp",  icon: <MessageSquare className="w-4 h-4" />, cor: "bg-emerald-900/30 text-emerald-300 border-emerald-800" },
  tarefa:   { label: "Tarefa",    icon: <CheckSquare className="w-4 h-4" />, cor: "bg-yellow-900/30 text-yellow-300 border-yellow-800" },
  linkedin: { label: "LinkedIn",  icon: <MessageSquare className="w-4 h-4" />, cor: "bg-indigo-900/30 text-indigo-300 border-indigo-800" },
};

// ─── Step Form Dialog ─────────────────────────────────────────────────────────

function StepDialog({
  open, onClose, initial, onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: CadenciaStep | null;
  onSave: (s: CadenciaStep) => void;
}) {
  const [form, setForm] = useState<CadenciaStep>(
    initial ?? { id: "", dia: 1, tipo: "email", titulo: "", descricao: "" }
  );

  React.useEffect(() => {
    setForm(initial ?? { id: "", dia: 1, tipo: "email", titulo: "", descricao: "" });
  }, [initial, open]);

  const handle = () => {
    if (!form.titulo.trim()) { toast.error("Título obrigatório"); return; }
    onSave({ ...form, id: form.id || Date.now().toString() });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Step" : "Novo Step"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Dia</label>
              <Input
                type="number" min={1}
                value={form.dia}
                onChange={(e) => setForm({ ...form, dia: parseInt(e.target.value) || 1 })}
                className="mt-1 bg-[#333] border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as CadenciaStep["tipo"] })}
                className="mt-1 w-full h-10 px-3 rounded-md bg-[#333] border border-border text-sm text-white"
              >
                {Object.entries(TIPO_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Título *</label>
            <Input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ex: Email de abertura"
              className="mt-1 bg-[#333] border-border"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Instruções</label>
            <Textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="O que o vendedor deve fazer neste step..."
              className="mt-1 bg-[#333] border-border"
              rows={3}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose} className="border-border">Cancelar</Button>
            <Button onClick={handle} className="bg-primary hover:bg-primary/90">
              {initial ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Cadência Form Dialog ─────────────────────────────────────────────────────

function CadenciaDialog({
  open, onClose, initial, onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: { nome: string; descricao: string } | null;
  onSave: (f: { nome: string; descricao: string }) => void;
}) {
  const [form, setForm] = useState({ nome: "", descricao: "" });

  React.useEffect(() => {
    setForm(initial ?? { nome: "", descricao: "" });
  }, [initial, open]);

  const handle = () => {
    if (!form.nome.trim()) { toast.error("Nome obrigatório"); return; }
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Cadência" : "Nova Cadência"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-foreground/80">Nome *</label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Prospecção Outbound"
              className="mt-1 bg-[#333] border-border"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Descrição</label>
            <Textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Objetivo e contexto desta cadência..."
              className="mt-1 bg-[#333] border-border"
              rows={3}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose} className="border-border">Cancelar</Button>
            <Button onClick={handle} className="bg-primary hover:bg-primary/90">
              {initial ? "Salvar" : "Criar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ConfigCadencias() {
  const utils = trpc.useUtils();
  const { data: cadencias = [], isLoading } = trpc.crm.cadences.list.useQuery();

  const createMutation = trpc.crm.cadences.create.useMutation({
    onSuccess: () => { utils.crm.cadences.list.invalidate(); toast.success("Cadência criada!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const updateMutation = trpc.crm.cadences.update.useMutation({
    onSuccess: () => { utils.crm.cadences.list.invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMutation = trpc.crm.cadences.delete.useMutation({
    onSuccess: () => { utils.crm.cadences.list.invalidate(); toast.success("Cadência excluída"); },
    onError: (e: any) => toast.error(e.message),
  });

  const [expanded, setExpanded] = useState<number | null>(null);
  const [cadenciaDialog, setCadenciaDialog] = useState<{ open: boolean; id?: number; initial: { nome: string; descricao: string } | null }>({ open: false, initial: null });
  const [stepDialog, setStepDialog] = useState<{ open: boolean; cadenciaId: number | null; initial: CadenciaStep | null }>({ open: false, cadenciaId: null, initial: null });

  const parseSteps = (raw: string | null | undefined): CadenciaStep[] => {
    try { return JSON.parse(raw || "[]"); } catch { return []; }
  };

  const saveSteps = (cadenciaId: number, steps: CadenciaStep[]) => {
    updateMutation.mutate({ id: cadenciaId, steps: JSON.stringify(steps) });
  };

  const handleSaveCadencia = (f: { nome: string; descricao: string }) => {
    if (cadenciaDialog.id !== undefined) {
      updateMutation.mutate({ id: cadenciaDialog.id, nome: f.nome, descricao: f.descricao },
        { onSuccess: () => toast.success("Cadência atualizada!") }
      );
    } else {
      createMutation.mutate({ nome: f.nome, descricao: f.descricao });
    }
  };

  const handleToggle = (id: number, current: boolean) => {
    updateMutation.mutate({ id, ativa: !current });
  };

  const handleSaveStep = (cadenciaId: number, currentSteps: CadenciaStep[], step: CadenciaStep) => {
    const exists = currentSteps.find((s) => s.id === step.id);
    const updated = exists
      ? currentSteps.map((s) => s.id === step.id ? step : s)
      : [...currentSteps, step];
    saveSteps(cadenciaId, updated.sort((a, b) => a.dia - b.dia));
    toast.success(exists ? "Step atualizado!" : "Step adicionado!");
  };

  const handleDeleteStep = (cadenciaId: number, steps: CadenciaStep[], stepId: string) => {
    saveSteps(cadenciaId, steps.filter((s) => s.id !== stepId));
    toast.success("Step removido");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-7 h-7 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold">Cadências de Vendas</h1>
            <p className="text-muted-foreground text-sm">Sequências de follow-up para o processo comercial</p>
          </div>
        </div>
        <Button
          onClick={() => setCadenciaDialog({ open: true, initial: null })}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Cadência
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{cadencias.length}</p>
            <p className="text-xs text-muted-foreground">Cadências</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{cadencias.filter((c: any) => c.ativa).length}</p>
            <p className="text-xs text-muted-foreground">Ativas</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {cadencias.reduce((acc: number, c: any) => acc + parseSteps(c.steps).length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Steps totais</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      {cadencias.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="py-16 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">Nenhuma cadência criada</p>
            <p className="text-xs text-muted-foreground mt-1">Clique em "Nova Cadência" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cadencias.map((cad: any) => {
            const steps = parseSteps(cad.steps);
            const duracao = steps.length > 0 ? Math.max(...steps.map((s) => s.dia)) : 0;
            const isExpanded = expanded === cad.id;

            return (
              <Card key={cad.id} className={`border-border overflow-hidden ${cad.ativa ? "bg-card" : "bg-card/50"}`}>
                {/* Header row */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#2f2f2f]"
                  onClick={() => setExpanded(isExpanded ? null : cad.id)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded
                      ? <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{cad.nome}</span>
                        <Badge className={cad.ativa ? "bg-green-900/30 text-green-300 text-xs" : "bg-[#444]/50 text-muted-foreground text-xs"}>
                          {cad.ativa ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {steps.length} steps{duracao > 0 ? ` · ${duracao} dias` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={cad.ativa}
                      onCheckedChange={() => handleToggle(cad.id, cad.ativa)}
                    />
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setCadenciaDialog({ open: true, id: cad.id, initial: { nome: cad.nome, descricao: cad.descricao || "" } })}
                      className="text-primary hover:text-primary"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => deleteMutation.mutate({ id: cad.id })}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded: description + steps */}
                {isExpanded && (
                  <div className="border-t border-border p-4">
                    {cad.descricao && (
                      <p className="text-sm text-foreground/70 mb-4">{cad.descricao}</p>
                    )}

                    {/* Timeline */}
                    <div className="space-y-0">
                      {steps.map((step, idx) => {
                        const cfg = TIPO_CONFIG[step.tipo] || TIPO_CONFIG.tarefa;
                        return (
                          <div key={step.id} className="flex gap-4">
                            <div className="flex flex-col items-center w-14 flex-shrink-0">
                              <div className="text-xs font-bold text-foreground/80 bg-[#333] px-2 py-1 rounded mb-1">
                                Dia {step.dia}
                              </div>
                              {idx < steps.length - 1 && (
                                <div className="flex-1 w-px bg-[#444] min-h-[20px]" />
                              )}
                            </div>
                            <div className={`flex-1 mb-3 p-3 rounded-lg border ${cfg.cor}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {cfg.icon}
                                  <Badge className={`text-xs ${cfg.cor}`}>{cfg.label}</Badge>
                                  <span className="font-medium text-sm">{step.titulo}</span>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost" size="sm"
                                    className="text-primary hover:text-primary h-6 w-6 p-0"
                                    onClick={() => setStepDialog({ open: true, cadenciaId: cad.id, initial: step })}
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost" size="sm"
                                    className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                                    onClick={() => handleDeleteStep(cad.id, steps, step.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              {step.descricao && (
                                <p className="text-xs text-muted-foreground mt-1">{step.descricao}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline" size="sm"
                      onClick={() => setStepDialog({ open: true, cadenciaId: cad.id, initial: null })}
                      className="mt-2 border-dashed border-border w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Step
                    </Button>

                    {steps.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground mt-4">
                        Nenhum step — clique em "Adicionar Step" para começar
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Cadência Dialog */}
      <CadenciaDialog
        open={cadenciaDialog.open}
        initial={cadenciaDialog.initial}
        onClose={() => setCadenciaDialog({ open: false, initial: null })}
        onSave={handleSaveCadencia}
      />

      {/* Step Dialog */}
      <StepDialog
        open={stepDialog.open}
        initial={stepDialog.initial}
        onClose={() => setStepDialog({ open: false, cadenciaId: null, initial: null })}
        onSave={(step) => {
          if (stepDialog.cadenciaId === null) return;
          const cad = cadencias.find((c: any) => c.id === stepDialog.cadenciaId);
          if (!cad) return;
          handleSaveStep(stepDialog.cadenciaId, parseSteps(cad.steps), step);
        }}
      />
    </div>
  );
}
