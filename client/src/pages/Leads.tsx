import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Filter, Loader, ArrowRightCircle, Thermometer, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LeadModal } from "@/components/LeadModal";
import { LeadActions } from "@/components/LeadActions";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { toast } from "sonner";

const temperatureColors: Record<string, string> = {
  quente: "bg-red-900/60 text-red-200 border border-red-700",
  morno: "bg-yellow-900/60 text-yellow-200 border border-yellow-700",
  frio: "bg-primary/20 text-primary/80 border border-primary/40",
  qualificado: "bg-green-900/60 text-green-200 border border-green-700",
};

const statusColors: Record<string, string> = {
  novo: "bg-slate-700 text-slate-200",
  contatado: "bg-primary/20 text-primary/80",
  qualificado: "bg-green-900/60 text-green-200",
  convertido: "bg-purple-900/60 text-purple-200",
  perdido: "bg-red-900/60 text-red-200",
};

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterQualificacao, setFilterQualificacao] = useState<string>("todos");
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [convertData, setConvertData] = useState({ titulo: "", valor: "" });

  const utils = trpc.useUtils();
  const leadsQuery = trpc.crm.leads.list.useQuery({ limit: 100 });
  const leads = leadsQuery.data || [];

  const qualifyMutation = trpc.crm.leads.updateQualification.useMutation({
    onSuccess: () => {
      toast.success("Qualificação atualizada!");
      utils.crm.leads.list.invalidate();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const convertMutation = trpc.crm.leads.convertToOpportunity.useMutation({
    onSuccess: () => {
      toast.success("Lead convertido em oportunidade!");
      setConvertDialogOpen(false);
      utils.crm.leads.list.invalidate();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const filteredLeads = leads.filter((lead: any) => {
    const matchSearch =
      lead.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchQualificacao =
      filterQualificacao === "todos" || lead.qualificacao === filterQualificacao;
    return matchSearch && matchQualificacao;
  });

  const handleQualify = (leadId: number, qualificacao: string) => {
    qualifyMutation.mutate({ id: leadId, qualificacao: qualificacao as any });
  };

  const openConvertDialog = (lead: any) => {
    setSelectedLead(lead);
    setConvertData({
      titulo: `Oportunidade - ${lead.titulo}`,
      valor: lead.valor_estimado?.toString() || "",
    });
    setConvertDialogOpen(true);
  };

  const handleConvert = () => {
    if (!selectedLead) return;
    convertMutation.mutate({
      leadId: selectedLead.id,
      opportunityTitle: convertData.titulo,
      valor: convertData.valor ? parseInt(convertData.valor) : 0,
      stageId: 1,
    });
  };

  // Stats
  const totalLeads = leads.length;
  const quentes = leads.filter((l: any) => l.qualificacao === "quente").length;
  const mornos = leads.filter((l: any) => l.qualificacao === "morno").length;
  const frios = leads.filter((l: any) => l.qualificacao === "frio").length;

  if (leadsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground mt-1">Gerenciamento de leads e prospectos</p>
        </div>
        <LeadModal onSuccess={() => leadsQuery.refetch()} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLeads}</p>
                <p className="text-xs text-muted-foreground">Total de Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-900/30 rounded-lg">
                <Thermometer className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{quentes}</p>
                <p className="text-xs text-muted-foreground">Quentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-900/30 rounded-lg">
                <Thermometer className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mornos}</p>
                <p className="text-xs text-muted-foreground">Mornos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Thermometer className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{frios}</p>
                <p className="text-xs text-muted-foreground">Frios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou descrição..."
            className="pl-10 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterQualificacao}
          onChange={(e) => setFilterQualificacao(e.target.value)}
          className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground/80"
        >
          <option value="todos">Todas Qualificações</option>
          <option value="frio">Frio</option>
          <option value="morno">Morno</option>
          <option value="quente">Quente</option>
          <option value="qualificado">Qualificado</option>
        </select>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
          <CardDescription>{filteredLeads.length} leads encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum lead encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Título</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Qualificação</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Origem</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Valor Estimado</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Qualificar</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead: any) => (
                    <tr key={lead.id} className="border-b border-border hover:bg-[#333333]/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{lead.titulo}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{lead.descricao}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || "bg-[#333333] text-foreground/80"}`}>
                          {lead.status || "novo"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${temperatureColors[lead.qualificacao] || "bg-[#333333] text-foreground/80"}`}>
                          {lead.qualificacao || "Não qualificado"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{lead.origem || "-"}</td>
                      <td className="py-3 px-4 font-medium">
                        {lead.valor_estimado ? `R$ ${(lead.valor_estimado / 1000).toFixed(0)}K` : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {["frio", "morno", "quente"].map((q) => (
                            <button
                              key={q}
                              onClick={() => handleQualify(lead.id, q)}
                              className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                                lead.qualificacao === q
                                  ? q === "frio" ? "bg-primary text-white" : q === "morno" ? "bg-yellow-500 text-black" : "bg-red-500 text-white"
                                  : "bg-[#333333] text-muted-foreground hover:bg-[#444444]"
                              }`}
                              title={q.charAt(0).toUpperCase() + q.slice(1)}
                            >
                              {q === "frio" ? "F" : q === "morno" ? "M" : "Q"}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <LeadActions lead={lead} onSuccess={() => leadsQuery.refetch()} />
                          {lead.status !== "convertido" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-400 hover:text-purple-300"
                              onClick={() => openConvertDialog(lead)}
                              title="Converter em Oportunidade"
                            >
                              <ArrowRightCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline for selected lead */}
      {selectedLead && !convertDialogOpen && (
        <ActivityTimeline contactId={selectedLead.id} />
      )}

      {/* Convert Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Converter Lead em Oportunidade</DialogTitle>
            <DialogDescription>
              Converter "{selectedLead?.titulo}" em uma oportunidade no funil de vendas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground/80">Título da Oportunidade</label>
              <Input
                value={convertData.titulo}
                onChange={(e) => setConvertData({ ...convertData, titulo: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Valor Estimado (R$)</label>
              <Input
                type="number"
                value={convertData.valor}
                onChange={(e) => setConvertData({ ...convertData, valor: e.target.value })}
                className="bg-[#333333] border-border mt-1"
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setConvertDialogOpen(false)} className="border-border">
                Cancelar
              </Button>
              <Button
                onClick={handleConvert}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={convertMutation.isPending}
              >
                {convertMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <ArrowRightCircle className="w-4 h-4 mr-2" />}
                Converter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
