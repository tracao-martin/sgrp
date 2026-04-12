import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Phone, Mail, Calendar, MessageSquare, FileText, Plus, Loader, Trash2, Clock,
} from "lucide-react";

const activityIcons: Record<string, React.ReactNode> = {
  ligacao: <Phone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  reuniao: <Calendar className="w-4 h-4" />,
  whatsapp: <MessageSquare className="w-4 h-4" />,
  nota: <FileText className="w-4 h-4" />,
};

const activityColors: Record<string, string> = {
  ligacao: "bg-blue-500",
  email: "bg-green-500",
  reuniao: "bg-purple-500",
  whatsapp: "bg-emerald-500",
  nota: "bg-gray-500",
};

interface ActivityTimelineProps {
  opportunityId?: number;
  contactId?: number;
}

export function ActivityTimeline({ opportunityId, contactId }: ActivityTimelineProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newActivity, setNewActivity] = useState({
    tipo: "nota",
    descricao: "",
  });

  const utils = trpc.useUtils();

  const oppQuery = trpc.crm.activities.getByOpportunity.useQuery(
    { opportunityId: opportunityId! },
    { enabled: !!opportunityId }
  );
  const contactQuery = trpc.crm.activities.getByContact.useQuery(
    { contactId: contactId! },
    { enabled: !!contactId && !opportunityId }
  );
  const allQuery = trpc.crm.activities.list.useQuery(
    undefined,
    { enabled: !opportunityId && !contactId }
  );
  const activitiesQuery = opportunityId ? oppQuery : contactId ? contactQuery : allQuery;

  const activities = activitiesQuery.data || [];

  const createMutation = trpc.crm.activities.create.useMutation({
    onSuccess: () => {
      toast.success("Atividade registrada!");
      setShowAddDialog(false);
      setNewActivity({ tipo: "nota", descricao: "" });
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

  const handleCreate = () => {
    createMutation.mutate({
      tipo: newActivity.tipo as any,
      titulo: newActivity.descricao.slice(0, 50) || "Atividade",
      descricao: newActivity.descricao,
      opportunity_id: opportunityId || undefined,
      contact_id: contactId || undefined,
    });
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Timeline de Atividades</CardTitle>
        <Button
          size="sm"
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" /> Registrar
        </Button>
      </CardHeader>
      <CardContent>
        {activitiesQuery.isLoading ? (
          <div className="flex justify-center py-6">
            <Loader className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma atividade registrada</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-700" />

            <div className="space-y-4">
              {activities.map((activity: any) => (
                <div key={activity.id} className="flex gap-4 relative">
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      activityColors[activity.tipo] || "bg-gray-600"
                    }`}
                  >
                    {activityIcons[activity.tipo] || <FileText className="w-4 h-4" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-gray-700/50 rounded-lg p-3 group">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase">
                          {activity.tipo}
                        </span>
                        <p className="text-sm mt-1">{activity.descricao}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {activity.createdAt
                            ? new Date(activity.createdAt).toLocaleDateString("pt-BR")
                            : ""}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 h-6 w-6 p-0"
                          onClick={() => deleteMutation.mutate({ id: activity.id })}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Add Activity Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Atividade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-gray-300">Tipo</label>
              <select
                value={newActivity.tipo}
                onChange={(e) => setNewActivity({ ...newActivity, tipo: e.target.value })}
                className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
              >
                <option value="nota">Nota</option>
                <option value="chamada">Ligação</option>
                <option value="email">Email</option>
                <option value="reuniao">Reunião</option>
                <option value="proposta">Proposta</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Descrição</label>
              <textarea
                value={newActivity.descricao}
                onChange={(e) => setNewActivity({ ...newActivity, descricao: e.target.value })}
                className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm min-h-[100px]"
                placeholder="Descreva a atividade..."
              />
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-gray-700">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="border-gray-600">
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={createMutation.isPending || !newActivity.descricao}
              >
                {createMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
