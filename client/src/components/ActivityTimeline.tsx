import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Phone, Mail, Calendar, MessageSquare, FileText, Plus, Loader, Trash2, Clock,
  Pencil, MapPin, Send, MoreHorizontal, CalendarClock, CheckCircle2,
} from "lucide-react";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

const ACTIVITY_TYPES = [
  { value: "chamada", label: "Ligação", icon: Phone, color: "bg-blue-500" },
  { value: "email", label: "Email", icon: Mail, color: "bg-green-500" },
  { value: "reuniao", label: "Reunião", icon: Calendar, color: "bg-purple-500" },
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "bg-emerald-500" },
  { value: "visita", label: "Visita", icon: MapPin, color: "bg-orange-500" },
  { value: "proposta", label: "Proposta", icon: Send, color: "bg-yellow-500" },
  { value: "nota", label: "Nota", icon: FileText, color: "bg-gray-500" },
  { value: "outro", label: "Outro", icon: MoreHorizontal, color: "bg-gray-600" },
] as const;

function getActivityMeta(tipo: string) {
  return ACTIVITY_TYPES.find(t => t.value === tipo) || ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1];
}

// ============================================================================
// ACTIVITY FORM DIALOG
// ============================================================================

function ActivityFormDialog({
  open,
  onClose,
  onSubmit,
  isPending,
  initialData,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { tipo: string; descricao: string; status: string; data_agendada?: string }) => void;
  isPending: boolean;
  initialData?: { tipo: string; descricao: string; status?: string; data_agendada?: string };
  title: string;
}) {
  const [tipo, setTipo] = useState(initialData?.tipo || "nota");
  const [descricao, setDescricao] = useState(initialData?.descricao || "");
  const [status, setStatus] = useState<"realizada" | "pendente">(
    (initialData?.status as "realizada" | "pendente") || "realizada"
  );
  const [dataAgendada, setDataAgendada] = useState(initialData?.data_agendada || "");

  React.useEffect(() => {
    if (open) {
      setTipo(initialData?.tipo || "nota");
      setDescricao(initialData?.descricao || "");
      setStatus((initialData?.status as "realizada" | "pendente") || "realizada");
      setDataAgendada(initialData?.data_agendada || "");
    }
  }, [open, initialData]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Activity Type Grid */}
          <div>
            <label className="text-sm font-medium text-foreground/80 mb-2 block">Tipo de Atividade</label>
            <div className="grid grid-cols-4 gap-2">
              {ACTIVITY_TYPES.map(t => {
                const Icon = t.icon;
                const isSelected = tipo === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTipo(t.value)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-[#333333]/50 text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status toggle: Realizada vs Pendente */}
          <div>
            <label className="text-sm font-medium text-foreground/80 mb-2 block">Tipo de registro</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus("realizada")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm transition-all ${
                  status === "realizada"
                    ? "border-green-500 bg-green-500/10 text-green-400"
                    : "border-border bg-[#333333]/50 text-muted-foreground hover:border-green-500/50"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Registrar (realizada)
              </button>
              <button
                type="button"
                onClick={() => setStatus("pendente")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm transition-all ${
                  status === "pendente"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-[#333333]/50 text-muted-foreground hover:border-primary/50"
                }`}
              >
                <CalendarClock className="w-4 h-4" />
                Agendar (próximo passo)
              </button>
            </div>
          </div>

          {/* Scheduled date — only when pendente */}
          {status === "pendente" && (
            <div>
              <label className="text-sm font-medium text-foreground/80">Data e hora agendada *</label>
              <input
                type="datetime-local"
                value={dataAgendada}
                onChange={(e) => setDataAgendada(e.target.value)}
                className="w-full mt-1 bg-[#333333] border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground/80">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full mt-1 bg-[#333333] border border-border rounded-md px-3 py-2 text-sm min-h-[100px] resize-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Descreva a atividade..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">
            Cancelar
          </Button>
          <Button
            onClick={() => onSubmit({ tipo, descricao, status, data_agendada: dataAgendada || undefined })}
            className="bg-primary hover:bg-primary/90"
            disabled={isPending || !descricao.trim() || (status === "pendente" && !dataAgendada)}
          >
            {isPending ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : initialData ? (
              <Pencil className="w-4 h-4 mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {initialData ? "Salvar" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ActivityTimelineProps {
  opportunityId?: number;
  contactId?: number;
  leadId?: number;
}

export function ActivityTimeline({ opportunityId, contactId, leadId }: ActivityTimelineProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);

  const utils = trpc.useUtils();

  // Queries
  const oppQuery = trpc.crm.activities.getByOpportunity.useQuery(
    { opportunityId: opportunityId! },
    { enabled: !!opportunityId }
  );
  const contactQuery = trpc.crm.activities.getByContact.useQuery(
    { contactId: contactId! },
    { enabled: !!contactId && !opportunityId && !leadId }
  );
  const leadQuery = trpc.crm.activities.getByLead.useQuery(
    { leadId: leadId! },
    { enabled: !!leadId && !opportunityId && !contactId }
  );
  const allQuery = trpc.crm.activities.list.useQuery(
    undefined,
    { enabled: !opportunityId && !contactId && !leadId }
  );
  const activitiesQuery = opportunityId ? oppQuery : leadId ? leadQuery : contactId ? contactQuery : allQuery;
  const activities = activitiesQuery.data || [];

  // Mutations
  const createMutation = trpc.crm.activities.create.useMutation({
    onSuccess: () => {
      toast.success("Atividade registrada!");
      setShowAddDialog(false);
      utils.crm.activities.invalidate();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const updateMutation = trpc.crm.activities.update.useMutation({
    onSuccess: () => {
      toast.success("Atividade atualizada!");
      setEditingActivity(null);
      utils.crm.activities.invalidate();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const deleteMutation = trpc.crm.activities.delete.useMutation({
    onSuccess: () => {
      toast.success("Atividade removida!");
      utils.crm.activities.invalidate();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const handleCreate = (data: { tipo: string; descricao: string; status: string; data_agendada?: string }) => {
    createMutation.mutate({
      tipo: data.tipo as any,
      titulo: data.descricao.slice(0, 50) || "Atividade",
      descricao: data.descricao,
      status: data.status as any,
      data_agendada: data.data_agendada,
      opportunity_id: opportunityId || undefined,
      contact_id: contactId || undefined,
      lead_id: leadId || undefined,
    });
  };

  const handleUpdate = (data: { tipo: string; descricao: string; status: string; data_agendada?: string }) => {
    if (!editingActivity) return;
    updateMutation.mutate({
      id: editingActivity.id,
      tipo: data.tipo as any,
      titulo: data.descricao.slice(0, 50) || "Atividade",
      descricao: data.descricao,
      status: data.status as any,
      data_agendada: data.data_agendada || null,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta atividade?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Timeline de Atividades</CardTitle>
        <Button
          size="sm"
          onClick={() => setShowAddDialog(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-1" /> Registrar
        </Button>
      </CardHeader>
      <CardContent>
        {activitiesQuery.isLoading ? (
          <div className="flex justify-center py-6">
            <Loader className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma atividade registrada</p>
            <p className="text-xs mt-1">Clique em "Registrar" para adicionar a primeira atividade</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-[#333333]" />

            <div className="space-y-4">
              {activities.map((activity: any) => {
                const meta = getActivityMeta(activity.tipo);
                const Icon = meta.icon;
                const isPendente = activity.status === "pendente";
                const createdAt = activity.createdAt || activity.data_atividade || activity.created_at;
                const displayDate = isPendente && activity.data_agendada ? activity.data_agendada : createdAt;

                return (
                  <div key={activity.id} className="flex gap-4 relative">
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 border-2 ${
                        isPendente
                          ? "border-primary bg-background"
                          : `${meta.color} border-transparent`
                      }`}
                    >
                      {isPendente
                        ? <CalendarClock className="w-4 h-4 text-primary" />
                        : <Icon className="w-4 h-4 text-white" />
                      }
                    </div>

                    {/* Content */}
                    <div className={`flex-1 rounded-lg p-3 group border ${
                      isPendente
                        ? "bg-primary/5 border-primary/30"
                        : "bg-[#333333]/50 border-transparent"
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-semibold uppercase tracking-wider ${
                              isPendente ? "text-primary" : "text-primary"
                            }`}>
                              {meta.label}
                            </span>
                            {isPendente && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                                Agendado
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {displayDate
                                ? new Date(displayDate).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>
                          <p className="text-sm mt-1 whitespace-pre-wrap break-words">{activity.descricao}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                            onClick={() => setEditingActivity(activity)}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                            onClick={() => handleDelete(activity.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      {/* Add Activity Dialog */}
      <ActivityFormDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
        title="Registrar Atividade"
      />

      {/* Edit Activity Dialog */}
      <ActivityFormDialog
        open={!!editingActivity}
        onClose={() => setEditingActivity(null)}
        onSubmit={handleUpdate}
        isPending={updateMutation.isPending}
        initialData={editingActivity ? {
          tipo: editingActivity.tipo,
          descricao: editingActivity.descricao || "",
          status: editingActivity.status || "realizada",
          data_agendada: editingActivity.data_agendada
            ? new Date(editingActivity.data_agendada).toISOString().slice(0, 16)
            : undefined,
        } : undefined}
        title="Editar Atividade"
      />
    </Card>
  );
}
