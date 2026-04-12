import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { Progress } from "@/components/ui/progress";

// ============================================================================
// LEAD SCORE CARD
// ============================================================================

const SCORE_ITEMS = [
  { key: "titulo", label: "Nome", weight: 1 },
  { key: "email", label: "Email", weight: 1 },
  { key: "telefone", label: "Telefone", weight: 1 },
  { key: "empresa", label: "Empresa", weight: 1 },
  { key: "cargo", label: "Cargo", weight: 1 },
  { key: "cpf_cnpj", label: "CPF/CNPJ", weight: 1 },
  { key: "setor", label: "Setor", weight: 1 },
  { key: "porte", label: "Porte", weight: 1 },
  { key: "regiao", label: "Regi\u00e3o", weight: 1 },
  { key: "origem", label: "Canal de Origem", weight: 1 },
  { key: "icp", label: "ICP", weight: 1 },
  { key: "cadencia", label: "Cad\u00eancia", weight: 1 },
];

function LeadScoreCard({ lead, localFields }: { lead: any; localFields: any }) {
  const filled = useMemo(() => {
    return SCORE_ITEMS.map(item => {
      let value = "";
      if (item.key === "titulo") value = lead?.titulo || "";
      else if (item.key === "email") value = localFields.email || "";
      else if (item.key === "telefone") value = localFields.telefone || "";
      else if (item.key === "empresa") value = localFields.empresa || "";
      else if (item.key === "cargo") value = localFields.cargo || "";
      else if (item.key === "cpf_cnpj") value = localFields.cpfCnpj || "";
      else if (item.key === "setor") value = localFields.setor || "";
      else if (item.key === "porte") value = localFields.porte || "";
      else if (item.key === "regiao") value = localFields.regiao || "";
      else if (item.key === "origem") value = lead?.origem || "";
      else if (item.key === "icp") value = localFields.icp || "";
      else if (item.key === "cadencia") value = localFields.cadencia || "";
      return { ...item, filled: !!value.trim() };
    });
  }, [lead, localFields]);

  const score = filled.filter(f => f.filled).length;
  const total = SCORE_ITEMS.length;
  const percent = Math.round((score / total) * 100);

  const missing = filled.filter(f => !f.filled);

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">Score do Lead</span>
        <span className={`text-lg font-bold ${
          percent >= 80 ? "text-green-400" : percent >= 50 ? "text-amber-400" : "text-red-400"
        }`}>
          {score}/{total}
        </span>
      </div>
      <Progress value={percent} className="h-2.5 mb-2" />
      <p className="text-xs text-muted-foreground mb-2">
        {percent >= 80
          ? "Lead bem qualificado. Dados completos para abordagem."
          : percent >= 50
          ? "Dados parciais. Preencha os campos faltantes para melhorar a qualifica\u00e7\u00e3o."
          : "Dados insuficientes. Priorize o preenchimento dos campos abaixo."}
      </p>
      {missing.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {missing.map(m => (
            <span key={m.key} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              {m.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

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
// DISQUALIFY DIALOG — uses real reasons from backend
// ============================================================================
function DisqualifyDialog({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [customMotivo, setCustomMotivo] = useState("");

  // Fetch real disqualify reasons from backend
  const reasonsQuery = trpc.crm.disqualifyReasons.list.useQuery(
    { tipo: "desqualificacao" },
    { enabled: open }
  );
  const reasons = reasonsQuery.data || [];

  useEffect(() => {
    if (open) { setMotivo(""); setCustomMotivo(""); }
  }, [open]);

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
            {reasons.filter((r: any) => r.nome.toLowerCase() !== "outro").map((r: any) => (
              <option key={r.id} value={r.nome}>{r.nome}</option>
            ))}
            <option value="__outro__">Outro</option>
          </select>
          {motivo === "__outro__" && (
            <textarea
              className="w-full bg-[#333] border border-border rounded-md px-3 py-2 text-sm min-h-[60px] resize-none"
              placeholder="Descreva o motivo..."
              value={customMotivo}
              onChange={e => setCustomMotivo(e.target.value)}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">Cancelar</Button>
          <Button
            onClick={() => {
              const finalMotivo = motivo === "__outro__" ? customMotivo : motivo;
              if (!finalMotivo) { toast.error("Selecione um motivo"); return; }
              onConfirm(finalMotivo);
            }}
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
// RETIRE DIALOG — uses real reasons from backend
// ============================================================================
function RetireDialog({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [customMotivo, setCustomMotivo] = useState("");

  // Fetch real retire reasons from backend
  const reasonsQuery = trpc.crm.disqualifyReasons.list.useQuery(
    { tipo: "aposentamento" },
    { enabled: open }
  );
  const reasons = reasonsQuery.data || [];

  useEffect(() => {
    if (open) { setMotivo(""); setCustomMotivo(""); }
  }, [open]);

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
            {reasons.filter((r: any) => r.nome.toLowerCase() !== "outro").map((r: any) => (
              <option key={r.id} value={r.nome}>{r.nome}</option>
            ))}
            <option value="__outro__">Outro</option>
          </select>
          {motivo === "__outro__" && (
            <textarea
              className="w-full bg-[#333] border border-border rounded-md px-3 py-2 text-sm min-h-[60px] resize-none"
              placeholder="Descreva o motivo..."
              value={customMotivo}
              onChange={e => setCustomMotivo(e.target.value)}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">Cancelar</Button>
          <Button
            onClick={() => {
              const finalMotivo = motivo === "__outro__" ? customMotivo : motivo;
              onConfirm(finalMotivo || "sem_motivo");
            }}
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

  // Real ICPs from backend
  const icpsQuery = trpc.crm.icps.list.useQuery();
  const icps = useMemo(() => {
    return (icpsQuery.data || []).filter((i: any) => i.ativa !== false).map((i: any) => ({
      id: i.id,
      nome: i.nome,
    }));
  }, [icpsQuery.data]);

  // Real Cadences from backend
  const cadencesQuery = trpc.crm.cadences.list.useQuery();
  const cadences = useMemo(() => {
    return (cadencesQuery.data || []).map((c: any) => ({
      id: c.id,
      nome: c.nome,
      steps: c.steps ? (typeof c.steps === "string" ? JSON.parse(c.steps) : c.steps) : [],
    }));
  }, [cadencesQuery.data]);

  const lead = useMemo(() => {
    if (!leadId) return null;
    return rawLeads.find((l: any) => l.id === leadId) || null;
  }, [rawLeads, leadId]);

  // Update mutation for persisting field changes
  const updateMutation = trpc.crm.leads.update.useMutation({
    onSuccess: () => {
      utils.crm.leads.list.invalidate();
    },
    onError: (err: any) => {
      toast.error(`Erro ao salvar: ${err.message}`);
    },
  });

  // Local state for fields
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

  // Map frontend field names to backend field names (snake_case)
  const fieldToBackendMap: Record<string, string> = {
    nome: "titulo",
    cargo: "cargo",
    telefone: "telefone",
    email: "email",
    empresa: "empresa",
    icp: "icp",
    linkedin: "linkedin",
    site: "site",
    cpfCnpj: "cpf_cnpj",
    cadencia: "cadencia",
    faseCadencia: "fase_cadencia",
    notas: "descricao",
    temperatura: "qualificacao",
    setor: "setor",
    porte: "porte",
    regiao: "regiao",
    origem: "origem",
  };

  const updateField = (field: string, value: string) => {
    setLocalFields(prev => ({ ...prev, [field]: value }));

    // Persist to backend
    if (leadId) {
      const backendField = fieldToBackendMap[field] || field;
      const payload: any = { id: leadId, [backendField]: value || undefined };
      updateMutation.mutate(payload, {
        onSuccess: () => toast.success(`${field} atualizado`),
      });
    }
  };

  // Actions
  const handleConvert = (data: { nomeEmpresa: string; segmento: string }) => {
    if (leadId) {
      updateMutation.mutate({ id: leadId, status: "convertido" as any }, {
        onSuccess: () => {
          toast.success(`Lead convertido em conta: ${data.nomeEmpresa}`);
          setShowConvert(false);
          navigate("/contas");
        },
      });
    }
  };

  const handleDisqualify = (motivo: string) => {
    if (leadId) {
      updateMutation.mutate(
        { id: leadId, status: "desqualificado" as any, motivo_desqualificacao: motivo } as any,
        {
          onSuccess: () => {
            toast.success("Lead desqualificado");
            setShowDisqualify(false);
            navigate("/leads");
          },
        }
      );
    }
  };

  const handleRetire = (motivo: string) => {
    if (leadId) {
      updateMutation.mutate(
        { id: leadId, status: "aposentado" as any, motivo_desqualificacao: motivo } as any,
        {
          onSuccess: () => {
            toast.success("Lead aposentado");
            setShowRetire(false);
            navigate("/leads");
          },
        }
      );
    }
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
        <div className="lg:col-span-2 space-y-0">
          <LeadScoreCard lead={lead} localFields={localFields} />
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold mb-3">Dados do Contato</h2>

          <InlineField label="Nome" value={(lead as any).titulo || ""} onSave={v => updateField("nome", v)} />
          <InlineField label="Cargo / Título" value={localFields.cargo} onSave={v => updateField("cargo", v)} />
          <InlineField
            label="ICP"
            value={localFields.icp}
            onSave={v => updateField("icp", v)}
            type="select"
            options={icps.map((i: any) => ({ value: i.nome, label: i.nome }))}
          />
          <InlineField label="Telefone" value={localFields.telefone} onSave={v => updateField("telefone", v)} />
          <InlineField label="Email" value={localFields.email} onSave={v => updateField("email", v)} />
          <InlineField label="Empresa" value={localFields.empresa} onSave={v => updateField("empresa", v)} />
          <InlineField label="LinkedIn" value={localFields.linkedin} onSave={v => updateField("linkedin", v)} placeholder="Clique para editar" />
          <InlineField label="Site" value={localFields.site} onSave={v => updateField("site", v)} placeholder="Clique para editar" />
          <InlineField label="CPF / CNPJ" value={localFields.cpfCnpj} onSave={v => updateField("cpfCnpj", v)} placeholder="Clique para editar" />

          <Separator />

          <InlineField label="Setor" value={localFields.setor} onSave={v => updateField("setor", v)} placeholder="Clique para editar" />
          <InlineField
            label="Porte"
            value={localFields.porte}
            onSave={v => updateField("porte", v)}
            type="select"
            options={COMPANY_SIZES.map(s => ({ value: s, label: s }))}
          />
          <InlineField label="Região" value={localFields.regiao} onSave={v => updateField("regiao", v)} placeholder="Clique para editar" />

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
            options={cadences.map((c: any) => ({ value: c.nome, label: c.nome }))}
          />
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
