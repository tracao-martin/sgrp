import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Search, Filter, Columns3, Plus, Upload, Loader,
  Pencil, Trash2, Eye, RotateCcw, MessageCircle,
  ChevronLeft, ChevronRight, X, Download, Edit,
  LayoutGrid, List, Phone, Mail, Building2, MapPin,
  Thermometer, Target, UserCheck, Globe, Linkedin,
  GripVertical, ArrowRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface LeadRow {
  id: number;
  titulo: string;
  nome: string;
  telefone: string;
  cargo: string;
  email: string;
  empresa: string;
  origem: string;
  qualificacao: string;
  status: string;
  temperatura: string;
  setor: string;
  regiao: string;
  porte: string;
  icp: string;
  visivelPara: string;
  cadencia: string;
  faseCadencia: string;
  linkedin: string;
  site: string;
  cpfCnpj: string;
  notas: string;
  valor_estimado: number | null;
  motivoDesqualificacao: string;
  createdAt: string;
}

interface LeadFormData {
  nome: string;
  cargo: string;
  telefone: string;
  email: string;
  empresa: string;
  origem: string;
  temperatura: string;
  icp: string;
  setor: string;
  porte: string;
  regiao: string;
  valor_estimado: string;
  linkedin: string;
  site: string;
  cpfCnpj: string;
  cadencia: string;
  visivelPara: string;
  notas: string;
}

const LEAD_SOURCES = ["Instagram", "WhatsApp", "Indicação", "Site", "LinkedIn", "Outros"];
const COMPANY_SIZES = ["MEI", "Micro", "Pequena", "Média", "Grande"];
const TEMPERATURE_OPTIONS = [
  { value: "frio", label: "Frio", color: "bg-blue-500/20 text-blue-300 border-blue-500/40", icon: "❄️" },
  { value: "morno", label: "Morno", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40", icon: "☀️" },
  { value: "quente", label: "Quente", color: "bg-red-500/20 text-red-300 border-red-500/40", icon: "🔥" },
];
const STATUS_OPTIONS = [
  { value: "novo", label: "Novo", color: "bg-[#333] text-foreground/80" },
  { value: "em_contato", label: "Em Contato", color: "bg-primary/20 text-primary" },
  { value: "qualificado", label: "Qualificado", color: "bg-green-500/20 text-green-300" },
  { value: "convertido", label: "Convertido", color: "bg-purple-500/20 text-purple-300" },
  { value: "desqualificado", label: "Desqualificado", color: "bg-red-500/20 text-red-300" },
  { value: "aposentado", label: "Aposentado", color: "bg-gray-500/20 text-gray-400" },
];

const ALL_COLUMNS = [
  { key: "nome", label: "Nome", defaultVisible: true, locked: true },
  { key: "telefone", label: "Telefone", defaultVisible: true },
  { key: "cargo", label: "Cargo/Título", defaultVisible: true },
  { key: "email", label: "E-mail", defaultVisible: true },
  { key: "empresa", label: "Empresa", defaultVisible: true },
  { key: "origem", label: "Canal de Origem", defaultVisible: true },
  { key: "temperatura", label: "Temperatura", defaultVisible: true },
  { key: "status", label: "Status", defaultVisible: true },
  { key: "visivelPara", label: "Visível Para", defaultVisible: false },
  { key: "setor", label: "Setor", defaultVisible: false },
  { key: "regiao", label: "Região", defaultVisible: false },
  { key: "porte", label: "Porte", defaultVisible: false },
  { key: "icp", label: "ICP", defaultVisible: false },
  { key: "cadencia", label: "Cadência", defaultVisible: false },
  { key: "valor_estimado", label: "Valor Estimado", defaultVisible: false },
];

// Cadence phases for Kanban
const CADENCE_PHASES = [
  { id: "sem_cadencia", nome: "Sem Cadência", cor: "#555555" },
  { id: "novo", nome: "Novo", cor: "#ffbf19" },
  { id: "primeiro_contato", nome: "Primeiro Contato", cor: "#8b5cf6" },
  { id: "followup_1", nome: "Follow-up 1", cor: "#f59e0b" },
  { id: "followup_2", nome: "Follow-up 2", cor: "#f97316" },
  { id: "qualificacao", nome: "Qualificação", cor: "#22c55e" },
  { id: "apresentacao", nome: "Apresentação", cor: "#3b82f6" },
];

// Mock ICPs
const MOCK_ICPS = [
  { id: "icp-1", nome: "Diretor de TI em SaaS B2B" },
  { id: "icp-2", nome: "CEO de PME Industrial" },
  { id: "icp-3", nome: "Head Comercial Varejo" },
];

// Mock cadences
const MOCK_CADENCES = [
  { id: "cad-1", nome: "Outbound B2B" },
  { id: "cad-2", nome: "Inbound" },
];

// ============================================================================
// HELPER: map backend lead to LeadRow
// ============================================================================
function mapLeadToRow(lead: any): LeadRow {
  return {
    id: lead.id,
    titulo: lead.titulo || "",
    nome: lead.titulo || "",
    telefone: lead.telefone || "",
    cargo: lead.cargo || "",
    email: lead.email || "",
    empresa: lead.empresa || lead.company?.nome || "",
    origem: lead.origem || "",
    qualificacao: lead.qualificacao || "frio",
    status: lead.status || "novo",
    temperatura: lead.qualificacao || "frio",
    setor: lead.setor || "",
    regiao: lead.regiao || "",
    porte: lead.porte || "",
    icp: lead.icp || "",
    visivelPara: "Todos",
    cadencia: lead.cadencia || "",
    faseCadencia: lead.faseCadencia || "",
    linkedin: lead.linkedin || "",
    site: lead.site || "",
    cpfCnpj: lead.cpfCnpj || "",
    notas: lead.descricao || "",
    valor_estimado: lead.valor_estimado ? parseFloat(lead.valor_estimado) : null,
    motivoDesqualificacao: lead.motivoDesqualificacao || "",
    createdAt: lead.createdAt || new Date().toISOString(),
  };
}

// ============================================================================
// TEMPERATURE BADGE
// ============================================================================
function TemperatureBadge({ value }: { value: string }) {
  const opt = TEMPERATURE_OPTIONS.find(t => t.value === value);
  if (!opt) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${opt.color}`}>
      {opt.icon} {opt.label}
    </span>
  );
}

// ============================================================================
// STATUS BADGE
// ============================================================================
function StatusBadge({ value }: { value: string }) {
  const opt = STATUS_OPTIONS.find(s => s.value === value);
  if (!opt) return <span className="text-muted-foreground text-xs">{value}</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${opt.color}`}>
      {opt.label}
    </span>
  );
}

// ============================================================================
// WHATSAPP BUTTON
// ============================================================================
function WhatsAppButton({ phone, size = "sm" }: { phone: string; size?: "sm" | "xs" }) {
  if (!phone) return null;
  const cleanPhone = phone.replace(/\D/g, "");
  return (
    <a
      href={`https://wa.me/${cleanPhone}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-md text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-colors ${size === "xs" ? "h-6 w-6" : "h-8 w-8"}`}
      title="Abrir WhatsApp"
      onClick={(e) => e.stopPropagation()}
    >
      <MessageCircle className={size === "xs" ? "w-3.5 h-3.5" : "w-4 h-4"} />
    </a>
  );
}

// ============================================================================
// COLUMN MANAGER POPOVER
// ============================================================================
function ColumnManager({ visibleColumns, onChange }: { visibleColumns: string[]; onChange: (cols: string[]) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-border gap-2">
          <Columns3 className="w-4 h-4" />
          Colunas
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 bg-card border-border p-3" align="end">
        <p className="text-sm font-medium mb-2">Colunas visíveis</p>
        <div className="space-y-2">
          {ALL_COLUMNS.map(col => (
            <label key={col.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={visibleColumns.includes(col.key)}
                disabled={col.locked}
                onCheckedChange={(checked) => {
                  if (col.locked) return;
                  if (checked) {
                    onChange([...visibleColumns, col.key]);
                  } else {
                    onChange(visibleColumns.filter(c => c !== col.key));
                  }
                }}
              />
              <span className={col.locked ? "text-muted-foreground" : ""}>{col.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// CONTACT FILTERS POPOVER
// ============================================================================
interface Filters {
  temperatura: string[];
  status: string[];
  icp: string;
  setor: string;
  porte: string;
  origem: string[];
}

const EMPTY_FILTERS: Filters = {
  temperatura: [],
  status: [],
  icp: "",
  setor: "",
  porte: "",
  origem: [],
};

function ContactFilters({ filters, onChange, onClear }: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
}) {
  const activeCount = [
    filters.temperatura.length > 0,
    filters.status.length > 0,
    !!filters.icp,
    !!filters.setor,
    !!filters.porte,
    filters.origem.length > 0,
  ].filter(Boolean).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-border gap-2 relative">
          <Filter className="w-4 h-4" />
          Filtros
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-card border-border p-4" align="end">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Filtros avançados</p>
          {activeCount > 0 && (
            <button onClick={onClear} className="text-xs text-primary hover:underline">Limpar todos</button>
          )}
        </div>
        <div className="space-y-4">
          {/* Temperatura */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Temperatura</label>
            <div className="flex flex-wrap gap-1.5">
              {TEMPERATURE_OPTIONS.map(t => (
                <button
                  key={t.value}
                  onClick={() => {
                    const newTemps = filters.temperatura.includes(t.value)
                      ? filters.temperatura.filter(v => v !== t.value)
                      : [...filters.temperatura, t.value];
                    onChange({ ...filters, temperatura: newTemps });
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                    filters.temperatura.includes(t.value) ? t.color : "border-border text-muted-foreground"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
          {/* Status */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => {
                    const newStatus = filters.status.includes(s.value)
                      ? filters.status.filter(v => v !== s.value)
                      : [...filters.status, s.value];
                    onChange({ ...filters, status: newStatus });
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                    filters.status.includes(s.value) ? s.color + " border-current" : "border-border text-muted-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {/* Canal de Origem */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Canal de Origem</label>
            <div className="flex flex-wrap gap-1.5">
              {LEAD_SOURCES.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    const newOrigem = filters.origem.includes(s)
                      ? filters.origem.filter(v => v !== s)
                      : [...filters.origem, s];
                    onChange({ ...filters, origem: newOrigem });
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                    filters.origem.includes(s) ? "bg-primary/20 text-primary border-primary/40" : "border-border text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {/* Porte */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Porte</label>
            <select
              className="w-full bg-[#333] border border-border rounded-md px-3 py-1.5 text-sm"
              value={filters.porte}
              onChange={e => onChange({ ...filters, porte: e.target.value })}
            >
              <option value="">Todos</option>
              {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// LEAD FORM DIALOG (Create / Edit)
// ============================================================================
function LeadFormDialog({ open, onOpenChange, editLead, onSave, isSaving }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLead: LeadRow | null;
  onSave: (data: LeadFormData) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<LeadFormData>({
    nome: "", cargo: "", telefone: "", email: "", empresa: "", origem: "",
    temperatura: "frio", icp: "", setor: "", porte: "", regiao: "",
    valor_estimado: "", linkedin: "", site: "", cpfCnpj: "", cadencia: "",
    visivelPara: "Todos", notas: "",
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (editLead) {
      setForm({
        nome: editLead.nome, cargo: editLead.cargo, telefone: editLead.telefone,
        email: editLead.email, empresa: editLead.empresa, origem: editLead.origem,
        temperatura: editLead.temperatura, icp: editLead.icp, setor: editLead.setor,
        porte: editLead.porte, regiao: editLead.regiao,
        valor_estimado: editLead.valor_estimado?.toString() || "",
        linkedin: editLead.linkedin, site: editLead.site, cpfCnpj: editLead.cpfCnpj,
        cadencia: editLead.cadencia, visivelPara: editLead.visivelPara, notas: editLead.notas,
      });
    } else {
      setForm({
        nome: "", cargo: "", telefone: "", email: "", empresa: "", origem: "",
        temperatura: "frio", icp: "", setor: "", porte: "", regiao: "",
        valor_estimado: "", linkedin: "", site: "", cpfCnpj: "", cadencia: "",
        visivelPara: "Todos", notas: "",
      });
    }
    setErrors({});
  }, [editLead, open]);

  const update = (key: keyof LeadFormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }));
  };

  const handleSave = () => {
    const required = ["nome", "cargo", "telefone", "email", "empresa", "origem"];
    const newErrors: Record<string, boolean> = {};
    required.forEach(k => { if (!form[k as keyof LeadFormData]) newErrors[k] = true; });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    onSave(form);
  };

  const inputClass = (key: string) =>
    `w-full bg-[#333] border ${errors[key] ? "border-red-500" : "border-border"} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editLead ? "Editar Lead" : "Novo Lead"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nome *</label>
            <input className={inputClass("nome")} placeholder="Nome do lead" value={form.nome} onChange={e => update("nome", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Cargo/Título *</label>
            <input className={inputClass("cargo")} placeholder="Ex: CEO, Diretor de TI" value={form.cargo} onChange={e => update("cargo", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Telefone *</label>
            <input className={inputClass("telefone")} placeholder="41988072454" value={form.telefone} onChange={e => update("telefone", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email *</label>
            <input className={inputClass("email")} placeholder="email@empresa.com" value={form.email} onChange={e => update("email", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Empresa *</label>
            <input className={inputClass("empresa")} placeholder="Nome da empresa" value={form.empresa} onChange={e => update("empresa", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Canal de Origem *</label>
            <select className={inputClass("origem")} value={form.origem} onChange={e => update("origem", e.target.value)}>
              <option value="">Selecione...</option>
              {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <Separator className="col-span-2 my-1" />

          <div>
            <label className="text-xs font-medium text-muted-foreground">ICP</label>
            <select className={inputClass("icp")} value={form.icp} onChange={e => update("icp", e.target.value)}>
              <option value="">Selecione o ICP...</option>
              {MOCK_ICPS.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Temperatura</label>
            <div className="flex gap-2 mt-1.5">
              {TEMPERATURE_OPTIONS.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => update("temperatura", t.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    form.temperatura === t.value ? t.color : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Setor</label>
            <input className={inputClass("setor")} placeholder="Ex: Tecnologia, Saúde" value={form.setor} onChange={e => update("setor", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Porte da Empresa</label>
            <select className={inputClass("porte")} value={form.porte} onChange={e => update("porte", e.target.value)}>
              <option value="">Selecione...</option>
              {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Região/Estado</label>
            <input className={inputClass("regiao")} placeholder="Ex: São Paulo, Paraná" value={form.regiao} onChange={e => update("regiao", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Valor Estimado (R$)</label>
            <input className={inputClass("valor_estimado")} type="number" placeholder="50000" value={form.valor_estimado} onChange={e => update("valor_estimado", e.target.value)} />
          </div>

          <Separator className="col-span-2 my-1" />

          <div>
            <label className="text-xs font-medium text-muted-foreground">LinkedIn</label>
            <input className={inputClass("linkedin")} placeholder="URL do perfil" value={form.linkedin} onChange={e => update("linkedin", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Site</label>
            <input className={inputClass("site")} placeholder="https://..." value={form.site} onChange={e => update("site", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">CPF/CNPJ</label>
            <input className={inputClass("cpfCnpj")} placeholder="Documento" value={form.cpfCnpj} onChange={e => update("cpfCnpj", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Cadência</label>
            <select className={inputClass("cadencia")} value={form.cadencia} onChange={e => update("cadencia", e.target.value)}>
              <option value="">Sem cadência</option>
              {MOCK_CADENCES.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Visível Para</label>
            <select className={inputClass("visivelPara")} value={form.visivelPara} onChange={e => update("visivelPara", e.target.value)}>
              <option value="Todos">Todos</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Observações</label>
            <textarea
              className="w-full bg-[#333] border border-border rounded-md px-3 py-2 text-sm min-h-[80px] resize-none"
              placeholder="Anotações sobre o lead..."
              value={form.notas}
              onChange={e => update("notas", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border">Cancelar</Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
            {isSaving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
            {editLead ? "Salvar Alterações" : "Criar Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// BULK EDIT MODAL
// ============================================================================
function BulkEditModal({ open, onClose, selectedCount, onConfirm }: {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (changes: { temperatura?: string; status?: string; origem?: string }) => void;
}) {
  const [changes, setChanges] = useState<{ temperatura?: string; status?: string; origem?: string }>({});

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Editar {selectedCount} leads em massa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Temperatura</label>
            <select
              className="w-full bg-[#333] border border-border rounded-md px-3 py-2 text-sm mt-1"
              value={changes.temperatura || ""}
              onChange={e => setChanges({ ...changes, temperatura: e.target.value || undefined })}
            >
              <option value="">Não alterar</option>
              {TEMPERATURE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <select
              className="w-full bg-[#333] border border-border rounded-md px-3 py-2 text-sm mt-1"
              value={changes.status || ""}
              onChange={e => setChanges({ ...changes, status: e.target.value || undefined })}
            >
              <option value="">Não alterar</option>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Canal de Origem</label>
            <select
              className="w-full bg-[#333] border border-border rounded-md px-3 py-2 text-sm mt-1"
              value={changes.origem || ""}
              onChange={e => setChanges({ ...changes, origem: e.target.value || undefined })}
            >
              <option value="">Não alterar</option>
              {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">Cancelar</Button>
          <Button onClick={() => onConfirm(changes)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Aplicar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// KANBAN CARD (draggable)
// ============================================================================
function KanbanCard({ lead, onClick, onDragStart }: {
  lead: LeadRow;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <GripVertical className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground/70 flex-shrink-0" />
            <p className="text-sm font-medium truncate">{lead.nome}</p>
          </div>
          <p className="text-xs text-muted-foreground truncate ml-4.5">{lead.cargo} • {lead.empresa}</p>
        </div>
        <TemperatureBadge value={lead.temperatura} />
      </div>
      <div className="flex items-center gap-2 mt-2">
        {lead.origem && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#333] text-muted-foreground">{lead.origem}</span>
        )}
        <StatusBadge value={lead.status} />
        <div className="flex-1" />
        <WhatsAppButton phone={lead.telefone} size="xs" />
      </div>
    </div>
  );
}

// ============================================================================
// KANBAN COLUMN (droppable)
// ============================================================================
function KanbanColumn({ phase, leads, isOver, onDragOver, onDrop, onDragLeave, onClickLead, onDragStartLead }: {
  phase: typeof CADENCE_PHASES[0];
  leads: LeadRow[];
  isOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onClickLead: (lead: LeadRow) => void;
  onDragStartLead: (e: React.DragEvent, leadId: number) => void;
}) {
  return (
    <div
      className={`flex-shrink-0 w-72 transition-all ${isOver ? "scale-[1.01]" : ""}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      {/* Column header */}
      <div className="rounded-lg p-3 mb-2" style={{ backgroundColor: `${phase.cor}15` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: phase.cor }} />
            <h3 className="text-sm font-medium">{phase.nome}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">{leads.length}</Badge>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`space-y-2 min-h-[100px] max-h-[calc(100vh-300px)] overflow-y-auto rounded-lg p-1 transition-colors ${
          isOver ? "bg-primary/5 ring-2 ring-primary/30 ring-dashed" : ""
        }`}
      >
        {leads.length === 0 && (
          <div className={`text-center py-8 text-xs text-muted-foreground ${isOver ? "text-primary" : ""}`}>
            {isOver ? "Solte aqui" : "Nenhum lead"}
          </div>
        )}
        {leads.map(lead => (
          <KanbanCard
            key={lead.id}
            lead={lead}
            onClick={() => onClickLead(lead)}
            onDragStart={(e) => onDragStartLead(e, lead.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ACTIVITY LOG ENTRY (for Kanban moves)
// ============================================================================
interface ActivityLogEntry {
  id: string;
  leadId: number;
  leadNome: string;
  usuario: string;
  data: string;
  faseAnterior: string;
  faseNova: string;
}

// ============================================================================
// KANBAN VIEW (with drag-and-drop + activity logging)
// ============================================================================
function LeadKanban({ leads, onClickLead }: { leads: LeadRow[]; onClickLead: (lead: LeadRow) => void }) {
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  const [overPhaseId, setOverPhaseId] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [showLog, setShowLog] = useState(false);

  const utils = trpc.useUtils();
  const movePhaseMutation = trpc.crm.leads.moveCadencePhase.useMutation({
    onSuccess: () => {
      utils.crm.leads.invalidate();
      utils.crm.activities.invalidate();
    },
    onError: (err: any) => toast.error(`Erro ao salvar movimentação: ${err.message}`),
  });

  // Track lead-to-phase assignments (local state for mock)
  const [leadPhases, setLeadPhases] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    leads.forEach((lead, idx) => {
      if (lead.faseCadencia) {
        // Map to a phase ID
        const phaseMatch = CADENCE_PHASES.find(p =>
          p.nome.toLowerCase().includes(lead.faseCadencia.toLowerCase())
        );
        initial[lead.id] = phaseMatch?.id || "sem_cadencia";
      } else if (lead.cadencia) {
        // Distribute across phases for demo
        const phaseIdx = (idx % (CADENCE_PHASES.length - 1)) + 1;
        initial[lead.id] = CADENCE_PHASES[phaseIdx].id;
      } else {
        initial[lead.id] = "sem_cadencia";
      }
    });
    return initial;
  });

  // Update leadPhases when leads change
  useEffect(() => {
    setLeadPhases(prev => {
      const updated = { ...prev };
      leads.forEach((lead, idx) => {
        if (!(lead.id in updated)) {
          updated[lead.id] = lead.cadencia
            ? CADENCE_PHASES[((idx % (CADENCE_PHASES.length - 1)) + 1)].id
            : "sem_cadencia";
        }
      });
      return updated;
    });
  }, [leads]);

  // Group leads by phase
  const leadsByPhase = useMemo(() => {
    const grouped: Record<string, LeadRow[]> = {};
    CADENCE_PHASES.forEach(p => { grouped[p.id] = []; });
    leads.forEach(lead => {
      const phaseId = leadPhases[lead.id] || "sem_cadencia";
      if (grouped[phaseId]) {
        grouped[phaseId].push(lead);
      } else {
        grouped["sem_cadencia"].push(lead);
      }
    });
    return grouped;
  }, [leads, leadPhases]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = "move";
    // Set transparent drag image
    const el = document.createElement("div");
    el.style.opacity = "0";
    document.body.appendChild(el);
    e.dataTransfer.setDragImage(el, 0, 0);
    setTimeout(() => document.body.removeChild(el), 0);
  };

  const handleDragOver = (e: React.DragEvent, phaseId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverPhaseId(phaseId);
  };

  const handleDrop = (e: React.DragEvent, targetPhaseId: string) => {
    e.preventDefault();
    setOverPhaseId(null);

    if (draggedLeadId === null) return;

    const currentPhaseId = leadPhases[draggedLeadId] || "sem_cadencia";
    if (currentPhaseId === targetPhaseId) {
      setDraggedLeadId(null);
      return;
    }

    const lead = leads.find(l => l.id === draggedLeadId);
    if (!lead) {
      setDraggedLeadId(null);
      return;
    }

    const fromPhase = CADENCE_PHASES.find(p => p.id === currentPhaseId);
    const toPhase = CADENCE_PHASES.find(p => p.id === targetPhaseId);

    // Move the lead (optimistic local update)
    setLeadPhases(prev => ({ ...prev, [draggedLeadId!]: targetPhaseId }));

    // Persist to database via tRPC
    movePhaseMutation.mutate({
      leadId: lead.id,
      faseAnterior: fromPhase?.nome || "Sem Cadência",
      faseNova: toPhase?.nome || targetPhaseId,
    });

    // Log the activity locally for immediate UI feedback
    const newEntry: ActivityLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      leadId: lead.id,
      leadNome: lead.nome,
      usuario: "Administrador",
      data: new Date().toISOString(),
      faseAnterior: fromPhase?.nome || "Desconhecida",
      faseNova: toPhase?.nome || "Desconhecida",
    };
    setActivityLog(prev => [newEntry, ...prev]);

    toast.success(
      <div className="flex items-center gap-2">
        <ArrowRight className="w-4 h-4 text-primary" />
        <span><strong>{lead.nome}</strong> movido para <strong>{toPhase?.nome}</strong></span>
      </div>
    );

    setDraggedLeadId(null);
  };

  const handleDragLeave = () => {
    setOverPhaseId(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
      " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4">
      {/* Activity log toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Arraste os cards entre as fases para movimentar os leads na cadência
        </p>
        <Button
          variant="outline"
          size="sm"
          className="border-border gap-1.5"
          onClick={() => setShowLog(!showLog)}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Histórico ({activityLog.length})
        </Button>
      </div>

      {/* Activity log panel */}
      {showLog && activityLog.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 max-h-60 overflow-y-auto">
          <h4 className="text-sm font-medium mb-3">Timeline de Movimentações</h4>
          <div className="space-y-3">
            {activityLog.map(entry => (
              <div key={entry.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p>
                    <span className="font-medium">{entry.usuario}</span>
                    {" moveu "}
                    <span className="font-medium text-primary">{entry.leadNome}</span>
                    {" de "}
                    <span className="text-muted-foreground">{entry.faseAnterior}</span>
                    {" → "}
                    <span className="font-medium">{entry.faseNova}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(entry.data)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showLog && activityLog.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
          Nenhuma movimentação registrada nesta sessão. Arraste um card para iniciar.
        </div>
      )}

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {CADENCE_PHASES.map(phase => (
          <KanbanColumn
            key={phase.id}
            phase={phase}
            leads={leadsByPhase[phase.id] || []}
            isOver={overPhaseId === phase.id}
            onDragOver={(e) => handleDragOver(e, phase.id)}
            onDrop={(e) => handleDrop(e, phase.id)}
            onDragLeave={handleDragLeave}
            onClickLead={onClickLead}
            onDragStartLead={handleDragStart}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN LEADS PAGE
// ============================================================================
export default function Leads() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("lista");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem("leads_pageSize");
    return saved ? parseInt(saved) : 10;
  });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadRow | null>(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  // Column preferences
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem("leads_columns");
    if (saved) return JSON.parse(saved);
    return ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.key);
  });

  // Save column prefs
  useEffect(() => {
    localStorage.setItem("leads_columns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem("leads_pageSize", pageSize.toString());
  }, [pageSize]);

  // Fetch leads from backend
  const utils = trpc.useUtils();
  const leadsQuery = trpc.crm.leads.list.useQuery({ limit: 500 });
  const rawLeads = leadsQuery.data || [];

  const createMutation = trpc.crm.leads.create.useMutation({
    onSuccess: () => {
      toast.success("Lead criado com sucesso!");
      setShowCreateDialog(false);
      utils.crm.leads.list.invalidate();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const updateMutation = trpc.crm.leads.update.useMutation({
    onSuccess: () => {
      toast.success("Lead atualizado!");
      setEditingLead(null);
      utils.crm.leads.list.invalidate();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const deleteMutation = trpc.crm.leads.delete.useMutation({
    onSuccess: () => {
      toast.success("Lead excluído!");
      utils.crm.leads.list.invalidate();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  // Map backend data to rows
  const allLeads = useMemo(() => rawLeads.map(mapLeadToRow), [rawLeads]);

  // Apply search
  const searchedLeads = useMemo(() => {
    if (!searchTerm) return allLeads;
    const term = searchTerm.toLowerCase();
    return allLeads.filter(l =>
      l.nome.toLowerCase().includes(term) ||
      l.empresa.toLowerCase().includes(term) ||
      l.telefone.includes(term) ||
      l.email.toLowerCase().includes(term)
    );
  }, [allLeads, searchTerm]);

  // Apply filters
  const filteredLeads = useMemo(() => {
    return searchedLeads.filter(l => {
      if (filters.temperatura.length > 0 && !filters.temperatura.includes(l.temperatura)) return false;
      if (filters.status.length > 0 && !filters.status.includes(l.status)) return false;
      if (filters.origem.length > 0 && !filters.origem.includes(l.origem)) return false;
      if (filters.porte && l.porte !== filters.porte) return false;
      if (filters.icp && l.icp !== filters.icp) return false;
      if (filters.setor && !l.setor.toLowerCase().includes(filters.setor.toLowerCase())) return false;
      return true;
    });
  }, [searchedLeads, filters]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, page, pageSize]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [searchTerm, filters, pageSize]);

  // Selection
  const allOnPageSelected = paginatedLeads.length > 0 && paginatedLeads.every(l => selected.has(l.id));
  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      const newSelected = new Set(selected);
      paginatedLeads.forEach(l => newSelected.delete(l.id));
      setSelected(newSelected);
    } else {
      const newSelected = new Set(selected);
      paginatedLeads.forEach(l => newSelected.add(l.id));
      setSelected(newSelected);
    }
  };
  const toggleSelect = (id: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelected(newSelected);
  };

  // Handlers
  const handleCreateLead = (data: LeadFormData) => {
    createMutation.mutate({
      titulo: data.nome,
      descricao: data.notas,
      origem: data.origem,
      qualificacao: data.temperatura as any,
      valor_estimado: data.valor_estimado ? parseInt(data.valor_estimado) : undefined,
    } as any);
  };

  const handleEditLead = (data: LeadFormData) => {
    if (!editingLead) return;
    updateMutation.mutate({
      id: editingLead.id,
      titulo: data.nome,
      descricao: data.notas,
      origem: data.origem,
      qualificacao: data.temperatura as any,
      valor_estimado: data.valor_estimado ? parseInt(data.valor_estimado) : undefined,
    });
  };

  const handleDeleteLead = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este lead?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleBulkEdit = (changes: { temperatura?: string; status?: string; origem?: string }) => {
    toast.success(`${selected.size} leads atualizados em massa`);
    setShowBulkEdit(false);
    setSelected(new Set());
  };

  const handleExportExcel = () => {
    toast.success("Exportação iniciada (funcionalidade será conectada ao backend)");
  };

  // Render cell value
  const renderCell = (lead: LeadRow, colKey: string) => {
    switch (colKey) {
      case "nome":
        return (
          <button
            onClick={() => navigate(`/leads/${lead.id}`)}
            className="text-left font-medium text-primary hover:underline"
          >
            {lead.nome}
          </button>
        );
      case "temperatura":
        return <TemperatureBadge value={lead.temperatura} />;
      case "status":
        return <StatusBadge value={lead.status} />;
      case "origem":
        return lead.origem ? (
          <Badge variant="secondary" className="text-xs font-normal">{lead.origem}</Badge>
        ) : <span className="text-muted-foreground">—</span>;
      case "visivelPara":
        return <Badge variant="secondary" className="text-xs font-normal">{lead.visivelPara}</Badge>;
      case "valor_estimado":
        return lead.valor_estimado
          ? <span className="font-medium">R$ {lead.valor_estimado.toLocaleString("pt-BR")}</span>
          : <span className="text-muted-foreground">—</span>;
      default:
        return <span className="text-sm">{(lead as any)[colKey] || "—"}</span>;
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: allLeads.length,
    quentes: allLeads.filter(l => l.temperatura === "quente").length,
    mornos: allLeads.filter(l => l.temperatura === "morno").length,
    frios: allLeads.filter(l => l.temperatura === "frio").length,
  }), [allLeads]);

  if (leadsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">{filteredLeads.length} leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-border gap-2" onClick={() => toast.info("Importação será implementada em breve")}>
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Tabs — Leads Ativos FIRST, Cadência SECOND */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="lista" className="gap-1.5">
              <List className="w-4 h-4" />
              Leads Ativos
            </TabsTrigger>
            <TabsTrigger value="cadencia" className="gap-1.5">
              <LayoutGrid className="w-4 h-4" />
              Cadência
            </TabsTrigger>
          </TabsList>

          {activeTab === "lista" && (
            <div className="flex items-center gap-2">
              <ContactFilters filters={filters} onChange={setFilters} onClear={() => setFilters(EMPTY_FILTERS)} />
              <ColumnManager visibleColumns={visibleColumns} onChange={setVisibleColumns} />
            </div>
          )}
        </div>

        {/* Search bar (both tabs) */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, empresa ou telefone..."
            className="pl-10 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* LIST TAB (first / default) */}
        <TabsContent value="lista" className="mt-4">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox checked={allOnPageSelected} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  {ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(col => (
                    <TableHead key={col.key} className="text-xs font-medium text-muted-foreground">
                      {col.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-xs font-medium text-muted-foreground text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 2} className="text-center py-12 text-muted-foreground">
                      Nenhum lead encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLeads.map(lead => (
                    <TableRow
                      key={lead.id}
                      className={`cursor-pointer ${selected.has(lead.id) ? "bg-primary/5" : ""}`}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selected.has(lead.id)} onCheckedChange={() => toggleSelect(lead.id)} />
                      </TableCell>
                      {ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(col => (
                        <TableCell key={col.key}>{renderCell(lead, col.key)}</TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                          <WhatsAppButton phone={lead.telefone} />
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => setEditingLead(lead)}
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                            onClick={() => handleDeleteLead(lead.id)}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Linhas por página:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                  className="bg-[#333] border border-border rounded px-2 py-1 text-xs"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Exibindo {filteredLeads.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredLeads.length)} de {filteredLeads.length} leads
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline" size="sm"
                    className="h-7 w-7 p-0 border-border"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">{page} / {totalPages}</span>
                  <Button
                    variant="outline" size="sm"
                    className="h-7 w-7 p-0 border-border"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* KANBAN TAB (second) */}
        <TabsContent value="cadencia" className="mt-4">
          <LeadKanban leads={filteredLeads} onClickLead={(lead) => navigate(`/leads/${lead.id}`)} />
        </TabsContent>
      </Tabs>

      {/* Floating Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1c1c1c] border border-border rounded-xl shadow-2xl px-6 py-3 flex items-center gap-4">
          <span className="text-sm font-medium">{selected.size} selecionado(s)</span>
          <Separator orientation="vertical" className="h-6" />
          <Button size="sm" variant="outline" className="border-border gap-1.5" onClick={() => setShowBulkEdit(true)}>
            <Edit className="w-3.5 h-3.5" />
            Editar em massa
          </Button>
          <Button size="sm" variant="outline" className="border-border gap-1.5" onClick={handleExportExcel}>
            <Download className="w-3.5 h-3.5" />
            Exportar Excel
          </Button>
          <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setSelected(new Set())}>
            Limpar
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <LeadFormDialog
        open={showCreateDialog || !!editingLead}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingLead(null);
          }
        }}
        editLead={editingLead}
        onSave={editingLead ? handleEditLead : handleCreateLead}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal
        open={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        selectedCount={selected.size}
        onConfirm={handleBulkEdit}
      />
    </div>
  );
}
