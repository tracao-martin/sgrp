import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  GripVertical, ArrowRight, FileSpreadsheet, AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import * as XLSX from "xlsx";

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
  cadenciaId: number | null;
  cadenceStageId: string;
  cadenceEnteredAt: string | null;
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
  cadenciaId: string;
  visivelPara: string;
  notas: string;
}

interface Stage {
  id: string;
  name: string;
  order: number;
}

interface CadenceWithStages {
  id: number;
  nome: string;
  stages: Stage[];
}

interface KanbanPhase {
  id: string;
  nome: string;
  cor: string;
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
  { value: "contatado", label: "Contatado", color: "bg-primary/20 text-primary" },
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

const STAGE_COLORS = [
  "#ffbf19", "#8b5cf6", "#f59e0b", "#f97316",
  "#22c55e", "#3b82f6", "#ec4899", "#06b6d4", "#84cc16", "#ef4444",
];

const SEM_CADENCIA_PHASE: KanbanPhase = { id: "sem_cadencia", nome: "Sem Cadência", cor: "#555555" };

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
    faseCadencia: lead.fase_cadencia || lead.faseCadencia || "",
    cadenciaId: lead.cadencia_id || null,
    cadenceStageId: lead.cadenceStageId || "",
    cadenceEnteredAt: lead.cadenceEnteredAt ? new Date(lead.cadenceEnteredAt).toISOString() : null,
    linkedin: lead.linkedin || "",
    site: lead.site || "",
    cpfCnpj: lead.cpf_cnpj || lead.cpfCnpj || "",
    notas: lead.descricao || "",
    valor_estimado: lead.valor_estimado ? parseFloat(lead.valor_estimado) : null,
    motivoDesqualificacao: lead.motivoDesqualificacao || lead.motivo_desqualificacao || "",
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
// CONTACT FILTERS POPOVER (with advanced filters)
// ============================================================================
interface Filters {
  temperatura: string[];
  status: string[];
  icp: string;
  setor: string;
  porte: string;
  origem: string[];
  cadencia: string;
  regiao: string;
}

const EMPTY_FILTERS: Filters = {
  temperatura: [],
  status: [],
  icp: "",
  setor: "",
  porte: "",
  origem: [],
  cadencia: "",
  regiao: "",
};

function ContactFilters({ filters, onChange, onClear, icps, cadences }: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
  icps: { id: number; nome: string }[];
  cadences: { id: number; nome: string }[];
}) {
  const activeCount = [
    filters.temperatura.length > 0,
    filters.status.length > 0,
    !!filters.icp,
    !!filters.setor,
    !!filters.porte,
    filters.origem.length > 0,
    !!filters.cadencia,
    !!filters.regiao,
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
      <PopoverContent className="w-80 bg-card border-border p-4 max-h-[70vh] overflow-y-auto" align="end">
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
          {/* ICP */}
          {icps.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ICP</label>
              <select
                className="w-full bg-[#333] border border-border rounded-md px-3 py-1.5 text-sm"
                value={filters.icp}
                onChange={e => onChange({ ...filters, icp: e.target.value })}
              >
                <option value="">Todos</option>
                {icps.map(i => <option key={i.id} value={i.nome}>{i.nome}</option>)}
              </select>
            </div>
          )}
          {/* Cadência */}
          {cadences.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Cadência</label>
              <select
                className="w-full bg-[#333] border border-border rounded-md px-3 py-1.5 text-sm"
                value={filters.cadencia}
                onChange={e => onChange({ ...filters, cadencia: e.target.value })}
              >
                <option value="">Todas</option>
                {cadences.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
            </div>
          )}
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
          {/* Região */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Região</label>
            <input
              className="w-full bg-[#333] border border-border rounded-md px-3 py-1.5 text-sm"
              placeholder="Filtrar por região..."
              value={filters.regiao}
              onChange={e => onChange({ ...filters, regiao: e.target.value })}
            />
          </div>
          {/* Setor */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Setor</label>
            <input
              className="w-full bg-[#333] border border-border rounded-md px-3 py-1.5 text-sm"
              placeholder="Filtrar por setor..."
              value={filters.setor}
              onChange={e => onChange({ ...filters, setor: e.target.value })}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// LEAD FORM DIALOG (Create / Edit) — uses real ICPs & Cadences
// ============================================================================
function LeadFormDialog({ open, onOpenChange, editLead, onSave, isSaving, icps, cadences }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLead: LeadRow | null;
  onSave: (data: LeadFormData) => void;
  isSaving: boolean;
  icps: { id: number; nome: string }[];
  cadences: { id: number; nome: string }[];
}) {
  const [form, setForm] = useState<LeadFormData>({
    nome: "", cargo: "", telefone: "", email: "", empresa: "", origem: "",
    temperatura: "frio", icp: "", setor: "", porte: "", regiao: "",
    valor_estimado: "", linkedin: "", site: "", cpfCnpj: "", cadenciaId: "",
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
        cadenciaId: editLead.cadenciaId?.toString() || "",
        visivelPara: editLead.visivelPara, notas: editLead.notas,
      });
    } else {
      setForm({
        nome: "", cargo: "", telefone: "", email: "", empresa: "", origem: "",
        temperatura: "frio", icp: "", setor: "", porte: "", regiao: "",
        valor_estimado: "", linkedin: "", site: "", cpfCnpj: "", cadenciaId: "",
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
              {icps.map(i => <option key={i.id} value={i.nome}>{i.nome}</option>)}
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
            <select className={inputClass("cadenciaId")} value={form.cadenciaId} onChange={e => update("cadenciaId", e.target.value)}>
              <option value="">Sem cadência</option>
              {cadences.map(c => <option key={c.id} value={c.id.toString()}>{c.nome}</option>)}
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
// BULK EDIT MODAL — calls real backend bulkUpdate
// ============================================================================
function BulkEditModal({ open, onClose, selectedCount, onConfirm, cadences }: {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (changes: { temperatura?: string; status?: string; origem?: string; cadencia?: string }) => void;
  cadences: { id: number; nome: string }[];
}) {
  const [changes, setChanges] = useState<{ temperatura?: string; status?: string; origem?: string; cadencia?: string }>({});

  useEffect(() => {
    if (open) setChanges({});
  }, [open]);

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
          <div>
            <label className="text-xs font-medium text-muted-foreground">Cadência</label>
            <select
              className="w-full bg-[#333] border border-border rounded-md px-3 py-2 text-sm mt-1"
              value={changes.cadencia || ""}
              onChange={e => setChanges({ ...changes, cadencia: e.target.value || undefined })}
            >
              <option value="">Não alterar</option>
              <option value="__remove__">Remover cadência</option>
              {cadences.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
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
// IMPORT EXCEL DIALOG
// ============================================================================
function ImportExcelDialog({ open, onClose, onImport }: {
  open: boolean;
  onClose: () => void;
  onImport: (leads: any[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setParsedData([]);
      setFileName("");
      setError("");
    }
  }, [open]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        if (json.length === 0) {
          setError("Planilha vazia. Verifique o arquivo.");
          return;
        }

        // Map common column names to our fields
        const columnMap: Record<string, string> = {
          "nome": "titulo", "name": "titulo", "titulo": "titulo", "lead": "titulo",
          "telefone": "telefone", "phone": "telefone", "tel": "telefone", "celular": "telefone",
          "email": "email", "e-mail": "email",
          "cargo": "cargo", "title": "cargo", "position": "cargo", "título": "cargo",
          "empresa": "empresa", "company": "empresa", "organização": "empresa", "organizacao": "empresa",
          "origem": "origem", "source": "origem", "canal": "origem",
          "setor": "setor", "industry": "setor", "indústria": "setor",
          "região": "regiao", "regiao": "regiao", "estado": "regiao", "uf": "regiao", "region": "regiao",
          "porte": "porte", "size": "porte", "tamanho": "porte",
          "linkedin": "linkedin",
          "site": "site", "website": "site",
          "cpf": "cpf_cnpj", "cnpj": "cpf_cnpj", "cpf_cnpj": "cpf_cnpj", "cpf/cnpj": "cpf_cnpj",
          "notas": "notas", "observações": "notas", "observacoes": "notas", "notes": "notas",
        };

        const mapped = json.map((row: any) => {
          const lead: Record<string, string> = {};
          for (const [key, val] of Object.entries(row)) {
            const normalizedKey = key.toLowerCase().trim();
            const mappedKey = columnMap[normalizedKey];
            if (mappedKey && val) {
              lead[mappedKey] = String(val).trim();
            }
          }
          return lead;
        }).filter((l: any) => l.titulo);

        if (mapped.length === 0) {
          setError("Nenhum lead válido encontrado. A planilha precisa ter pelo menos uma coluna 'Nome' ou 'Titulo'.");
          return;
        }

        setParsedData(mapped);
      } catch (err) {
        setError("Erro ao ler o arquivo. Verifique se é um arquivo Excel válido (.xlsx, .xls, .csv).");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-400" />
            Importar Leads via Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Faça upload de um arquivo Excel (.xlsx, .xls) ou CSV com os leads.
            As colunas serão mapeadas automaticamente.
          </p>

          <div className="bg-[#333]/50 border border-dashed border-border rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFile}
            />
            <Button
              variant="outline"
              className="border-border gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Selecionar Arquivo
            </Button>
            {fileName && (
              <p className="text-sm text-foreground mt-2">{fileName}</p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {parsedData.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">{parsedData.length} leads encontrados</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Colunas detectadas: {Object.keys(parsedData[0] || {}).join(", ")}
              </p>
              <div className="mt-2 max-h-32 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-1 text-muted-foreground">Nome</th>
                      <th className="text-left py-1 text-muted-foreground">Empresa</th>
                      <th className="text-left py-1 text-muted-foreground">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 5).map((l, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-1">{l.titulo}</td>
                        <td className="py-1">{l.empresa || "—"}</td>
                        <td className="py-1">{l.email || "—"}</td>
                      </tr>
                    ))}
                    {parsedData.length > 5 && (
                      <tr><td colSpan={3} className="py-1 text-muted-foreground">... e mais {parsedData.length - 5} leads</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-[#333]/30 rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Colunas aceitas:</p>
            <p className="text-xs text-muted-foreground">
              Nome*, Telefone, Email, Cargo, Empresa, Origem, Setor, Região, Porte, LinkedIn, Site, CPF/CNPJ, Notas
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">Cancelar</Button>
          <Button
            onClick={() => onImport(parsedData)}
            className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
            disabled={parsedData.length === 0}
          >
            <Upload className="w-4 h-4" />
            Importar {parsedData.length} Leads
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
  const daysInCadence = lead.cadenceEnteredAt
    ? Math.floor((Date.now() - new Date(lead.cadenceEnteredAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors group"
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <GripVertical className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground/70 flex-shrink-0" />
            <p className="text-sm font-medium truncate">{lead.nome}</p>
          </div>
          <p className="text-xs text-muted-foreground truncate pl-4">{lead.empresa}</p>
        </div>
        <TemperatureBadge value={lead.temperatura} />
      </div>
      {daysInCadence !== null && (
        <p className="text-[10px] text-primary/70 pl-4 mb-1.5">
          {daysInCadence === 0 ? "Entrou hoje na cadência" : `${daysInCadence} dia${daysInCadence === 1 ? "" : "s"} na cadência`}
        </p>
      )}
      <div className="flex items-center gap-2 mt-1">
        {lead.origem && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#333] text-muted-foreground">{lead.origem}</span>
        )}
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
  phase: KanbanPhase;
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
      <div className="rounded-lg p-3 mb-2" style={{ backgroundColor: `${phase.cor}15` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: phase.cor }} />
            <h3 className="text-sm font-medium">{phase.nome}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">{leads.length}</Badge>
        </div>
      </div>
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
// KANBAN VIEW (with cadence selector + dynamic stages)
// ============================================================================
function LeadKanban({
  leads,
  cadencesWithStages,
  onClickLead,
}: {
  leads: LeadRow[];
  cadencesWithStages: CadenceWithStages[];
  onClickLead: (lead: LeadRow) => void;
}) {
  const [selectedCadenceId, setSelectedCadenceId] = useState<number | null>(
    cadencesWithStages[0]?.id ?? null
  );
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  const [overPhaseId, setOverPhaseId] = useState<string | null>(null);
  const [leadPhaseOverrides, setLeadPhaseOverrides] = useState<Record<number, string>>({});

  // Sync default selection when cadences load
  useEffect(() => {
    if (selectedCadenceId === null && cadencesWithStages.length > 0) {
      setSelectedCadenceId(cadencesWithStages[0].id);
    }
  }, [cadencesWithStages]);

  const utils = trpc.useUtils();
  const movePhaseMutation = trpc.crm.leads.moveCadencePhase.useMutation({
    onSuccess: () => { utils.crm.leads.list.invalidate(); },
    onError: (err: any) => {
      toast.error(`Erro ao mover: ${err.message}`);
      utils.crm.leads.list.invalidate();
    },
  });

  const selectedCadence = cadencesWithStages.find(c => c.id === selectedCadenceId) ?? null;
  const stages = selectedCadence?.stages ?? [];

  const phases: KanbanPhase[] = useMemo(() => [
    SEM_CADENCIA_PHASE,
    ...stages.map((s, i) => ({ id: s.id, nome: s.name, cor: STAGE_COLORS[i % STAGE_COLORS.length] })),
  ], [stages]);

  const leadsByPhase = useMemo(() => {
    const grouped: Record<string, LeadRow[]> = {};
    phases.forEach(p => { grouped[p.id] = []; });

    const leadsInCadence = leads.filter(l => l.cadenciaId === selectedCadenceId);
    const leadsWithoutCadence = leads.filter(l => !l.cadenciaId);

    leadsWithoutCadence.forEach(lead => {
      grouped["sem_cadencia"].push(lead);
    });

    leadsInCadence.forEach(lead => {
      const stageId = leadPhaseOverrides[lead.id] || lead.cadenceStageId;
      if (stageId && grouped[stageId]) {
        grouped[stageId].push(lead);
      } else if (stages[0]) {
        grouped[stages[0].id].push(lead);
      }
    });

    return grouped;
  }, [leads, phases, selectedCadenceId, stages, leadPhaseOverrides]);

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = "move";
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
    const lead = leads.find(l => l.id === draggedLeadId);
    if (!lead) { setDraggedLeadId(null); return; }

    const currentPhaseId = leadPhaseOverrides[draggedLeadId] || lead.cadenceStageId || "sem_cadencia";
    if (currentPhaseId === targetPhaseId) { setDraggedLeadId(null); return; }

    if (targetPhaseId === "sem_cadencia" || currentPhaseId === "sem_cadencia") {
      toast.error("Use o formulário de edição para alterar a cadência do lead.");
      setDraggedLeadId(null);
      return;
    }

    const fromPhase = phases.find(p => p.id === currentPhaseId);
    const toPhase = phases.find(p => p.id === targetPhaseId);

    setLeadPhaseOverrides(prev => ({ ...prev, [draggedLeadId]: targetPhaseId }));
    movePhaseMutation.mutate({
      leadId: lead.id,
      faseAnterior: fromPhase?.nome || currentPhaseId,
      faseNova: toPhase?.nome || targetPhaseId,
      stageId: targetPhaseId,
    });

    toast.success(
      <div className="flex items-center gap-2">
        <ArrowRight className="w-4 h-4 text-primary" />
        <span><strong>{lead.nome}</strong> → <strong>{toPhase?.nome}</strong></span>
      </div>
    );
    setDraggedLeadId(null);
  };

  if (cadencesWithStages.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg py-16 text-center">
        <LayoutGrid className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground text-sm">Nenhuma cadência configurada</p>
        <p className="text-xs text-muted-foreground mt-1">Configure cadências em Configurações → Cadências</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cadence selector */}
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground flex-shrink-0">Visualizando cadência:</p>
        <div className="flex gap-1.5 flex-wrap">
          {cadencesWithStages.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCadenceId(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedCadenceId === c.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground/70 hover:border-foreground/30"
              }`}
            >
              {c.nome}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <p className="text-xs text-muted-foreground">
          {(leadsByPhase[selectedCadence ? stages[0]?.id || "sem_cadencia" : "sem_cadencia"] || []).length > 0
            ? ""
            : ""
          }
          Arraste os cards para mover entre fases
        </p>
      </div>

      {selectedCadence && stages.length === 0 && (
        <div className="bg-card border border-border rounded-lg py-10 text-center">
          <p className="text-muted-foreground text-sm">Esta cadência não tem fases configuradas.</p>
          <p className="text-xs text-muted-foreground mt-1">Configure fases em Configurações → Cadências</p>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {phases.map(phase => (
          <KanbanColumn
            key={phase.id}
            phase={phase}
            leads={leadsByPhase[phase.id] || []}
            isOver={overPhaseId === phase.id}
            onDragOver={(e) => handleDragOver(e, phase.id)}
            onDrop={(e) => handleDrop(e, phase.id)}
            onDragLeave={() => setOverPhaseId(null)}
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
  const [activeTab, setActiveTab] = useState("cadencia");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem("leads_pageSize");
    const parsed = saved ? parseInt(saved) : 10;
    return isNaN(parsed) || parsed <= 0 ? 10 : parsed;
  });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadRow | null>(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Column preferences
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem("leads_columns");
    if (saved) return JSON.parse(saved);
    return ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.key);
  });

  useEffect(() => {
    localStorage.setItem("leads_columns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem("leads_pageSize", pageSize.toString());
  }, [pageSize]);

  // ========== BACKEND QUERIES ==========
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
    return (cadencesQuery.data || []).filter((c: any) => c.ativa !== false).map((c: any) => ({
      id: c.id,
      nome: c.nome,
    }));
  }, [cadencesQuery.data]);

  const cadencesWithStages = useMemo((): CadenceWithStages[] => {
    return (cadencesQuery.data || [])
      .filter((c: any) => c.ativa !== false)
      .map((c: any) => ({
        id: c.id as number,
        nome: c.nome as string,
        stages: (() => {
          try {
            return (JSON.parse(c.stages || "[]") as Stage[]).sort((a, b) => a.order - b.order);
          } catch { return [] as Stage[]; }
        })(),
      }));
  }, [cadencesQuery.data]);

  // ========== MUTATIONS ==========
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

  const bulkUpdateMutation = trpc.crm.leads.bulkUpdate.useMutation({
    onSuccess: (data: any) => {
      toast.success(`${data.updated} leads atualizados em massa!`);
      setShowBulkEdit(false);
      setSelected(new Set());
      utils.crm.leads.list.invalidate();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const bulkCreateMutation = trpc.crm.leads.bulkCreate.useMutation({
    onSuccess: (data: any) => {
      toast.success(`${data.created} leads importados com sucesso!`);
      if (data.errors?.length > 0) {
        toast.warning(`${data.errors.length} leads com erro na importação`);
      }
      setShowImport(false);
      utils.crm.leads.list.invalidate();
    },
    onError: (err: any) => toast.error(`Erro na importação: ${err.message}`),
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

  // Apply filters (including new advanced filters)
  const filteredLeads = useMemo(() => {
    return searchedLeads.filter(l => {
      if (filters.temperatura.length > 0 && !filters.temperatura.includes(l.temperatura)) return false;
      if (filters.status.length > 0 && !filters.status.includes(l.status)) return false;
      if (filters.origem.length > 0 && !filters.origem.includes(l.origem)) return false;
      if (filters.porte && l.porte !== filters.porte) return false;
      if (filters.icp && l.icp !== filters.icp) return false;
      if (filters.setor && !l.setor.toLowerCase().includes(filters.setor.toLowerCase())) return false;
      if (filters.cadencia && l.cadencia !== filters.cadencia) return false;
      if (filters.regiao && !l.regiao.toLowerCase().includes(filters.regiao.toLowerCase())) return false;
      return true;
    });
  }, [searchedLeads, filters]);

  // Per-tab filtered lead sets
  const activeLeads = useMemo(
    () => filteredLeads.filter(l => l.status !== "aposentado" && l.status !== "desqualificado" && l.status !== "convertido"),
    [filteredLeads]
  );
  const aposentadoLeads = useMemo(() => filteredLeads.filter(l => l.status === "aposentado"), [filteredLeads]);
  const desqualificadoLeads = useMemo(() => filteredLeads.filter(l => l.status === "desqualificado"), [filteredLeads]);

  // Pagination (applies to active leads list tab)
  const totalPages = Math.max(1, Math.ceil(activeLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * pageSize;
    return activeLeads.slice(start, start + pageSize);
  }, [activeLeads, page, pageSize]);

  useEffect(() => { setPage(1); }, [searchTerm, filters, pageSize, activeTab]);

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

  // ========== HANDLERS ==========
  const handleCreateLead = (data: LeadFormData) => {
    createMutation.mutate({
      titulo: data.nome,
      descricao: data.notas,
      origem: data.origem || undefined,
      qualificacao: (data.temperatura || "frio") as any,
      valor_estimado: data.valor_estimado ? parseFloat(data.valor_estimado) : undefined,
      telefone: data.telefone || undefined,
      email: data.email || undefined,
      cargo: data.cargo || undefined,
      empresa: data.empresa || undefined,
      linkedin: data.linkedin || undefined,
      site: data.site || undefined,
      cpf_cnpj: data.cpfCnpj || undefined,
      setor: data.setor || undefined,
      regiao: data.regiao || undefined,
      porte: data.porte || undefined,
      cadencia_id: data.cadenciaId ? parseInt(data.cadenciaId) : undefined,
      notas: data.notas || undefined,
      icp: data.icp || undefined,
    } as any);
  };

  const handleEditLead = (data: LeadFormData) => {
    if (!editingLead) return;
    updateMutation.mutate({
      id: editingLead.id,
      titulo: data.nome,
      descricao: data.notas,
      origem: data.origem || undefined,
      qualificacao: (data.temperatura || "frio") as any,
      valor_estimado: data.valor_estimado ? parseFloat(data.valor_estimado) : undefined,
      telefone: data.telefone || undefined,
      email: data.email || undefined,
      cargo: data.cargo || undefined,
      empresa: data.empresa || undefined,
      linkedin: data.linkedin || undefined,
      site: data.site || undefined,
      cpf_cnpj: data.cpfCnpj || undefined,
      setor: data.setor || undefined,
      regiao: data.regiao || undefined,
      porte: data.porte || undefined,
      cadencia_id: data.cadenciaId ? parseInt(data.cadenciaId) : null,
      notas: data.notas || undefined,
    });
  };

  const handleDeleteLead = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este lead?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleBulkEdit = (changes: { temperatura?: string; status?: string; origem?: string; cadencia?: string }) => {
    const ids = Array.from(selected);
    const payload: any = { ids };
    if (changes.temperatura) payload.qualificacao = changes.temperatura;
    if (changes.status) payload.status = changes.status;
    if (changes.origem) payload.origem = changes.origem;
    if (changes.cadencia === "__remove__") {
      payload.cadencia = null;
    } else if (changes.cadencia) {
      payload.cadencia = changes.cadencia;
    }
    bulkUpdateMutation.mutate(payload);
  };

  const handleImport = (leads: any[]) => {
    bulkCreateMutation.mutate({ leads });
  };

  const handleExportExcel = () => {
    const leadsToExport = selected.size > 0
      ? allLeads.filter(l => selected.has(l.id))
      : filteredLeads;

    const data = leadsToExport.map(l => ({
      "Nome": l.nome,
      "Cargo": l.cargo,
      "Telefone": l.telefone,
      "Email": l.email,
      "Empresa": l.empresa,
      "Canal de Origem": l.origem,
      "Temperatura": l.temperatura,
      "Status": l.status,
      "Setor": l.setor,
      "Região": l.regiao,
      "Porte": l.porte,
      "ICP": l.icp,
      "Cadência": l.cadencia,
      "Fase Cadência": l.faseCadencia,
      "LinkedIn": l.linkedin,
      "Site": l.site,
      "CPF/CNPJ": l.cpfCnpj,
      "Valor Estimado": l.valor_estimado,
      "Observações": l.notas,
      "Data Criação": l.createdAt ? new Date(l.createdAt).toLocaleDateString("pt-BR") : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `leads_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`${leadsToExport.length} leads exportados com sucesso!`);
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
          <p className="text-sm text-muted-foreground">{allLeads.length} leads · {activeLeads.length} ativos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-border gap-2" onClick={handleExportExcel}>
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" className="border-border gap-2" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="cadencia" className="gap-1.5">
              <LayoutGrid className="w-4 h-4" />
              Cadência
            </TabsTrigger>
            <TabsTrigger value="ativos" className="gap-1.5">
              <List className="w-4 h-4" />
              Leads Ativos
              {activeLeads.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{activeLeads.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="aposentados" className="gap-1.5">
              Aposentados
              {aposentadoLeads.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{aposentadoLeads.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="desqualificados" className="gap-1.5">
              Desqualificados
              {desqualificadoLeads.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{desqualificadoLeads.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {activeTab === "ativos" && (
            <div className="flex items-center gap-2">
              <ContactFilters
                filters={filters}
                onChange={setFilters}
                onClear={() => setFilters(EMPTY_FILTERS)}
                icps={icps}
                cadences={cadences}
              />
              <ColumnManager visibleColumns={visibleColumns} onChange={setVisibleColumns} />
            </div>
          )}
        </div>

        {/* Search bar */}
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

        {/* ACTIVE LEADS TABLE */}
        <TabsContent value="ativos" className="mt-4">
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
                  Exibindo {activeLeads.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, activeLeads.length)} de {activeLeads.length} leads
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

        {/* KANBAN TAB */}
        <TabsContent value="cadencia" className="mt-4">
          <LeadKanban
            leads={activeLeads}
            cadencesWithStages={cadencesWithStages}
            onClickLead={(lead) => navigate(`/leads/${lead.id}`)}
          />
        </TabsContent>

        {/* APOSENTADOS TAB */}
        <TabsContent value="aposentados" className="mt-4">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-muted-foreground">Nome</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Empresa</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Temperatura</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Cadência</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aposentadoLeads.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Nenhum lead aposentado</TableCell></TableRow>
                ) : aposentadoLeads.map(lead => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.nome}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{lead.empresa || "—"}</TableCell>
                    <TableCell><TemperatureBadge value={lead.temperatura} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{lead.cadencia || "—"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-0.5">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditingLead(lead)} title="Editar"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400" onClick={() => handleDeleteLead(lead.id)} title="Excluir"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* DESQUALIFICADOS TAB */}
        <TabsContent value="desqualificados" className="mt-4">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-muted-foreground">Nome</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Empresa</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Temperatura</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Motivo</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {desqualificadoLeads.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Nenhum lead desqualificado</TableCell></TableRow>
                ) : desqualificadoLeads.map(lead => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.nome}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{lead.empresa || "—"}</TableCell>
                    <TableCell><TemperatureBadge value={lead.temperatura} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{lead.motivoDesqualificacao || "—"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-0.5">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditingLead(lead)} title="Editar"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400" onClick={() => handleDeleteLead(lead.id)} title="Excluir"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
        icps={icps}
        cadences={cadences}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal
        open={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        selectedCount={selected.size}
        onConfirm={handleBulkEdit}
        cadences={cadences}
      />

      {/* Import Excel Dialog */}
      <ImportExcelDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />
    </div>
  );
}
