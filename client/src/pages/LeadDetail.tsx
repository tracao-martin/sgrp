import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRoute, useLocation } from "wouter";
import {
  ArrowLeft, MessageCircle, Building2, UserX, Archive,
  Loader, Phone, Mail, Globe, Linkedin, FileText,
  Calendar, Plus, Pencil, Check, X, ExternalLink,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ActivityTimeline } from "@/components/ActivityTimeline";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

const LEAD_SOURCES = ["Instagram", "WhatsApp", "Indicação", "Site", "LinkedIn", "Outros"];
const COMPANY_SIZES = ["MEI", "Micro", "Pequena", "Média", "Grande"];
const TEMPERATURE_OPTIONS = [
  { value: "frio", label: "❄️ Frio", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  { value: "morno", label: "☀️ Morno", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" },
  { value: "quente", label: "🔥 Quente", color: "bg-red-500/20 text-red-300 border-red-500/40" },
];

const MOCK_ICPS = [
  { id: "icp-1", nome: "Diretor de TI em SaaS B2B" },
  { id: "icp-2", nome: "CEO de PME Industrial" },
  { id: "icp-3", nome: "Head Comercial Varejo" },
];

const MOCK_CADENCES = [
  { id: "cad-1", nome: "Outbound B2B", fases: ["Novo", "Primeiro Contato", "Follow-up 1", "Follow-up 2", "Qualificação"] },
  { id: "cad-2", nome: "Inbound", fases: ["Lead Recebido", "Contato Inicial", "Diagnóstico"] },
];

// ============================================================================
// INLINE EDITABLE FIELD
// ============================================================================
function InlineField({ label, value, onSave, type = "text", options, placeholder }: {
  label: string;
  value: string;
  onSave: (val: string) => void;
  type?: "text" | "select" | "textarea" | "temperature";
  options?: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (type === "temperature") {
    return (
      <div>
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <div className="flex gap-2 mt-1.5">
          {TEMPERATURE_OPTIONS.map(t => (
            <button
              key={t.value}
              onClick={() => onSave(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                value === t.value ? t.color : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div>
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <div className="flex items-center gap-1 mt-1">
          {type === "select" && options ? (
            <select
              className="flex-1 bg-[#333] border border-primary/50 rounded-md px-3 py-1.5 text-sm"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              autoFocus
            >
              <option value="">Selecione...</option>
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : type === "textarea" ? (
            <textarea
              className="flex-1 bg-[#333] border border-primary/50 rounded-md px-3 py-1.5 text-sm min-h-[60px] resize-none"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              autoFocus
            />
          ) : (
            <input
              className="flex-1 bg-[#333] border border-primary/50 rounded-md px-3 py-1.5 text-sm"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              autoFocus
              onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
            />
          )}
          <button onClick={handleSave} className="p-1 text-green-400 hover:text-green-300">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={handleCancel} className="p-1 text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group cursor-pointer"
      onClick={() => setEditing(true)}
    >
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-1 mt-0.5 min-h-[28px]">
        <span className={`text-sm ${value ? "" : "text-muted-foreground italic"}`}>
          {type === "select" && options
            ? options.find(o => o.value === value)?.label || value || placeholder || "Clique para editar"
            : value || placeholder || "Clique para editar"
          }
        </span>
        <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

// ============================================================================
// ACTIVITY TIMELINE (inline simplified)
// ============================================================================
function SimpleTimeline({ leadId }: { leadId: number }) {
  const [activities, setActivities] = useState<Array<{
    id: number;
    tipo: string;
    descricao: string;
    data: string;
  }>>([]);
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ tipo: "nota", descricao: "" });

  const addActivity = () => {
    if (!newActivity.descricao.trim()) {
      toast.error("Descreva a atividade");
      return;
    }
    setActivities(prev => [{
      id: Date.now(),
      tipo: newActivity.tipo,
      descricao: newActivity.descricao,
      data: new Date().toISOString(),
    }, ...prev]);
    setNewActivity({ tipo: "nota", descricao: "" });
    setShowNewActivity(false);
    toast.success("Atividade registrada!");
  };

  const tipoIcons: Record<string, string> = {
    nota: "📝",
    ligacao: "📞",
    email: "📧",
    reuniao: "📅",
    whatsapp: "💬",
    tarefa: "✅",
  };

  const tipoLabels: Record<string, string> = {
    nota: "Nota",
    ligacao: "Ligação",
    email: "E-mail",
    reuniao: "Reunião",
    whatsapp: "WhatsApp",
    tarefa: "Tarefa",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Timeline de Atividades</h3>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            className="border-border text-xs gap-1"
            onClick={() => toast.info("Agendamento será implementado em breve")}
          >
            <Calendar className="w-3.5 h-3.5" />
            Nova Agenda
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1"
            onClick={() => setShowNewActivity(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Atividade
          </Button>
        </div>
      </div>

      {showNewActivity && (
        <div className="bg-[#333]/50 border border-border rounded-lg p-4 mb-4">
          <div className="flex gap-2 mb-3">
            {Object.entries(tipoLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setNewActivity(prev => ({ ...prev, tipo: key }))}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  newActivity.tipo === key ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {tipoIcons[key]} {label}
              </button>
            ))}
          </div>
          <textarea
            className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm min-h-[80px] resize-none mb-3"
            placeholder="Descreva a atividade..."
            value={newActivity.descricao}
            onChange={e => setNewActivity(prev => ({ ...prev, descricao: e.target.value }))}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="border-border" onClick={() => setShowNewActivity(false)}>Cancelar</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={addActivity}>Registrar</Button>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhuma atividade registrada ainda.</p>
          <p className="text-xs mt-1">Clique em "Nova Atividade" para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map(act => (
            <div key={act.id} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-sm flex-shrink-0">
                {tipoIcons[act.tipo] || "📝"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{tipoLabels[act.tipo] || act.tipo}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(act.data).toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 mt-0.5">{act.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CONVERT TO ACCOUNT DIALOG
// ============================================================================
function ConvertDialog({ open, onClose, leadName, onConfirm }: {
  open: boolean;
  onClose: () => void;
  leadName: string;
  onConfirm: (data: { nomeEmpresa: string; segmento: string }) => void;
}) {
  const [nomeEmpresa, setNomeEmpresa] = useState(leadName);
  const [segmento, setSegmento] = useState("");

  useEffect(() => { setNomeEmpresa(leadName); }, [leadName]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-400" />
            Converter em Conta
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          O lead será convertido em uma conta (empresa) no sistema. Confirme os dados abaixo:
        </p>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nome da Empresa *</label>
            <input
              className="w-full bg-[#333] border border-border rounded-md px-3 py-2 text-sm mt-1"
              value={nomeEmpresa}
              onChange={e => setNomeEmpresa(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Segmento</label>
            <input
              className="w-full bg-[#333] border border-border rounded-md px-3 py-2 text-sm mt-1"
              placeholder="Ex: Tecnologia, Saúde, Varejo"
              value={segmento}
              onChange={e => setSegmento(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">Cancelar</Button>
          <Button
            onClick={() => onConfirm({ nomeEmpresa, segmento })}
            className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
          >
            <Building2 className="w-4 h-4" />
            Converter em Conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// DISQUALIFY DIALOG
// ============================================================================
function DisqualifyDialog({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-400" />
            Desqualificar Lead
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Informe o motivo da desqualificação. O lead poderá ser reativado depois.
        </p>
        <div className="py-2">
          <label className="text-xs font-medium text-muted-foreground">Motivo *</label>
          <select
            className="w-full bg-[#333] border border-border rounded-md px-3 py-2 text-sm mt-1 mb-3"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
          >
            <option value="">Selecione o motivo...</option>
            <option value="sem_budget">Sem budget</option>
            <option value="sem_autoridade">Sem autoridade de decisão</option>
            <option value="sem_necessidade">Sem necessidade identificada</option>
            <option value="timing_ruim">Timing inadequado</option>
            <option value="concorrente">Escolheu concorrente</option>
            <option value="dados_invalidos">Dados inválidos</option>
            <option value="nao_responde">Não responde</option>
            <option value="outro">Outro</option>
          </select>
          {motivo === "outro" && (
            <textarea
              className="w-full bg-[#333] border border-border rounded-md px-3 py-2 text-sm min-h-[60px] resize-none"
              placeholder="Descreva o motivo..."
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">Cancelar</Button>
          <Button
            onClick={() => { if (!motivo) { toast.error("Selecione um motivo"); return; } onConfirm(motivo); }}
            className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
          >
            <UserX className="w-4 h-4" />
            Desqualificar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// RETIRE DIALOG
// ============================================================================
function RetireDialog({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-gray-400" />
            Aposentar Lead
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          O lead será arquivado. Poderá ser reativado no futuro se necessário.
        </p>
        <div className="py-2">
          <label className="text-xs font-medium text-muted-foreground">Motivo</label>
          <select
            className="w-full bg-[#333] border border-border rounded-md px-3 py-2 text-sm mt-1 mb-3"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
          >
            <option value="">Selecione o motivo...</option>
            <option value="sem_resposta_prolongada">Sem resposta prolongada</option>
            <option value="empresa_fechou">Empresa fechou</option>
            <option value="contato_saiu">Contato saiu da empresa</option>
            <option value="mercado_nao_atendido">Mercado não atendido</option>
            <option value="nutrir_futuro">Nutrir no futuro</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">Cancelar</Button>
          <Button
            onClick={() => { onConfirm(motivo || "sem_motivo"); }}
            className="bg-gray-600 hover:bg-gray-700 text-white gap-1.5"
          >
            <Archive className="w-4 h-4" />
            Aposentar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN LEAD DETAIL PAGE
// ============================================================================
export default function LeadDetail() {
  const [, navigate] = useLocation();
  const [matched, params] = useRoute("/leads/:id");
  const leadId = params?.id ? parseInt(params.id) : null;

  // Dialogs
  const [showConvert, setShowConvert] = useState(false);
  const [showDisqualify, setShowDisqualify] = useState(false);
  const [showRetire, setShowRetire] = useState(false);

  // Fetch lead data
  const utils = trpc.useUtils();
  const leadsQuery = trpc.crm.leads.list.useQuery({ limit: 500 });
  const rawLeads = leadsQuery.data || [];

  const lead = useMemo(() => {
    if (!leadId) return null;
    return rawLeads.find((l: any) => l.id === leadId) || null;
  }, [rawLeads, leadId]);

  // Local state for fields not yet in backend
  const [localFields, setLocalFields] = useState({
    telefone: "",
    cargo: "",
    email: "",
    empresa: "",
    icp: "",
    linkedin: "",
    site: "",
    cpfCnpj: "",
    cadencia: "",
    faseCadencia: "",
    visivelPara: "Todos",
    notas: "",
    temperatura: "frio",
    setor: "",
    porte: "",
    regiao: "",
  });

  // Sync local fields when lead loads
  useEffect(() => {
    if (lead) {
      setLocalFields({
        telefone: (lead as any).telefone || "",
        cargo: (lead as any).cargo || "",
        email: (lead as any).email || "",
        empresa: (lead as any).empresa || (lead as any).company?.nome || "",
        icp: (lead as any).icp || "",
        linkedin: (lead as any).linkedin || "",
        site: (lead as any).site || "",
        cpfCnpj: (lead as any).cpf_cnpj || (lead as any).cpfCnpj || "",
        cadencia: (lead as any).cadencia || "",
        faseCadencia: (lead as any).fase_cadencia || (lead as any).faseCadencia || "",
        visivelPara: "Todos",
        notas: (lead as any).descricao || "",
        temperatura: (lead as any).qualificacao || "frio",
        setor: (lead as any).setor || "",
        porte: (lead as any).porte || "",
        regiao: (lead as any).regiao || "",
      });
    }
  }, [lead]);

  const updateField = (field: string, value: string) => {
    setLocalFields(prev => ({ ...prev, [field]: value }));
    toast.success(`${field} atualizado`);
  };

  // Actions
  const handleConvert = (data: { nomeEmpresa: string; segmento: string }) => {
    toast.success(`Lead convertido em conta: ${data.nomeEmpresa}`);
    setShowConvert(false);
    // In the future: call backend to create company + update lead status
    navigate("/contas");
  };

  const handleDisqualify = (motivo: string) => {
    toast.success("Lead desqualificado");
    setShowDisqualify(false);
    navigate("/leads");
  };

  const handleRetire = (motivo: string) => {
    toast.success("Lead aposentado");
    setShowRetire(false);
    navigate("/leads");
  };

  const handleWhatsApp = () => {
    const phone = localFields.telefone.replace(/\D/g, "");
    if (phone) {
      window.open(`https://wa.me/${phone}`, "_blank");
    } else {
      toast.error("Telefone não informado");
    }
  };

  if (leadsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">Lead não encontrado</p>
        <Button variant="outline" onClick={() => navigate("/leads")} className="border-border gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Leads
        </Button>
      </div>
    );
  }

  const leadStatus = (lead as any).status || "novo";
  const isActive = !["convertido", "desqualificado", "aposentado"].includes(leadStatus);

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/leads")} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{(lead as any).titulo}</h1>
            <p className="text-sm text-muted-foreground">
              {localFields.cargo}{localFields.cargo && localFields.empresa ? " • " : ""}{localFields.empresa}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>

          {isActive && (
            <>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                onClick={() => setShowConvert(true)}
              >
                <Building2 className="w-4 h-4" />
                Converter em Conta
              </Button>
              <Button
                variant="outline" size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 gap-1.5"
                onClick={() => setShowDisqualify(true)}
              >
                <UserX className="w-4 h-4" />
                Desqualificar
              </Button>
              <Button
                variant="outline" size="sm"
                className="border-border text-muted-foreground hover:text-foreground gap-1.5"
                onClick={() => setShowRetire(true)}
              >
                <Archive className="w-4 h-4" />
                Aposentar
              </Button>
            </>
          )}

          {!isActive && (
            <Badge className={
              leadStatus === "convertido" ? "bg-purple-500/20 text-purple-300" :
              leadStatus === "desqualificado" ? "bg-red-500/20 text-red-300" :
              "bg-gray-500/20 text-gray-400"
            }>
              {leadStatus === "convertido" ? "Convertido" :
               leadStatus === "desqualificado" ? "Desqualificado" : "Aposentado"}
            </Badge>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Lead Data */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold mb-3">Dados do Contato</h2>

          <InlineField label="Nome" value={(lead as any).titulo || ""} onSave={v => updateField("nome", v)} />
          <InlineField label="Cargo / Título" value={localFields.cargo} onSave={v => updateField("cargo", v)} />
          <InlineField
            label="ICP"
            value={localFields.icp}
            onSave={v => updateField("icp", v)}
            type="select"
            options={MOCK_ICPS.map(i => ({ value: i.id, label: i.nome }))}
          />
          <InlineField label="Telefone" value={localFields.telefone} onSave={v => updateField("telefone", v)} />
          <InlineField label="Email" value={localFields.email} onSave={v => updateField("email", v)} />
          <InlineField label="Empresa" value={localFields.empresa} onSave={v => updateField("empresa", v)} />
          <InlineField label="LinkedIn" value={localFields.linkedin} onSave={v => updateField("linkedin", v)} placeholder="Clique para editar" />
          <InlineField label="Site" value={localFields.site} onSave={v => updateField("site", v)} placeholder="Clique para editar" />
          <InlineField label="CPF / CNPJ" value={localFields.cpfCnpj} onSave={v => updateField("cpfCnpj", v)} placeholder="Clique para editar" />

          <Separator />

          <InlineField
            label="Canal de Origem"
            value={(lead as any).origem || ""}
            onSave={v => updateField("origem", v)}
            type="select"
            options={LEAD_SOURCES.map(s => ({ value: s, label: s }))}
          />
          <InlineField
            label="Cadência"
            value={localFields.cadencia}
            onSave={v => updateField("cadencia", v)}
            type="select"
            options={MOCK_CADENCES.map(c => ({ value: c.id, label: c.nome }))}
          />
          {localFields.cadencia && (
            <InlineField
              label="Fase da Cadência"
              value={localFields.faseCadencia}
              onSave={v => updateField("faseCadencia", v)}
              type="select"
              options={(MOCK_CADENCES.find(c => c.id === localFields.cadencia)?.fases || []).map(f => ({ value: f, label: f }))}
            />
          )}
          <InlineField
            label="Visível Para"
            value={localFields.visivelPara}
            onSave={v => updateField("visivelPara", v)}
            type="select"
            options={[{ value: "Todos", label: "Todos" }]}
          />

          <Separator />

          <InlineField
            label="Observações"
            value={localFields.notas}
            onSave={v => updateField("notas", v)}
            type="textarea"
            placeholder="Clique para editar"
          />

          <InlineField
            label="Temperatura"
            value={localFields.temperatura}
            onSave={v => updateField("temperatura", v)}
            type="temperature"
          />
        </div>

        {/* Right: Activity Timeline */}
        <div className="lg:col-span-3 bg-card border border-border rounded-lg p-5">
          <ActivityTimeline leadId={leadId || 0} />
        </div>
      </div>

      {/* Dialogs */}
      <ConvertDialog
        open={showConvert}
        onClose={() => setShowConvert(false)}
        leadName={localFields.empresa || (lead as any).titulo || ""}
        onConfirm={handleConvert}
      />
      <DisqualifyDialog
        open={showDisqualify}
        onClose={() => setShowDisqualify(false)}
        onConfirm={handleDisqualify}
      />
      <RetireDialog
        open={showRetire}
        onClose={() => setShowRetire(false)}
        onConfirm={handleRetire}
      />
    </div>
  );
}
