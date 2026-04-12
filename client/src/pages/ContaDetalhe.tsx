import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Building2, Globe, Linkedin, Phone, Mail, MapPin, Edit2, Check, X, Plus, Trash2, Loader, ExternalLink, Users, Briefcase, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useParams, useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActivityTimeline } from "@/components/ActivityTimeline";

// ============================================================================
// ACCOUNT SCORE CARD
// ============================================================================
function AccountScoreCard({ company }: { company: any }) {
  const fields = [
    { key: "nome", label: "Nome" },
    { key: "email", label: "Email" },
    { key: "telefone", label: "Telefone" },
    { key: "cnpj", label: "CNPJ" },
    { key: "segmento", label: "Segmento" },
    { key: "tamanho", label: "Tamanho" },
    { key: "cidade", label: "Cidade" },
    { key: "website", label: "Website" },
    { key: "lead_source", label: "Origem" },
  ];

  const filled = fields.filter(f => company[f.key] && String(company[f.key]).trim() !== "");
  const missing = fields.filter(f => !company[f.key] || String(company[f.key]).trim() === "");
  const score = filled.length;
  const total = fields.length;
  const pct = Math.round((score / total) * 100);

  const color = pct >= 80 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-red-400";
  const bgColor = pct >= 80 ? "bg-green-400" : pct >= 50 ? "bg-yellow-400" : "bg-red-400";

  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Completude do Cadastro</h3>
          <span className={`text-lg font-bold ${color}`}>{score}/{total}</span>
        </div>
        <div className="w-full bg-[#333333] rounded-full h-2 mb-3">
          <div className={`h-2 rounded-full ${bgColor} transition-all`} style={{ width: `${pct}%` }} />
        </div>
        {missing.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {missing.map(f => (
              <span key={f.key} className="text-xs px-2 py-0.5 bg-red-900/30 text-red-300 rounded">{f.label}</span>
            ))}
          </div>
        )}
        {missing.length === 0 && <p className="text-xs text-green-400">Cadastro completo!</p>}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// STAKEHOLDERS SECTION
// ============================================================================
function StakeholdersSection({ companyId }: { companyId: number }) {
  const [showAdd, setShowAdd] = useState(false);
  const [role, setRole] = useState("");
  const [contactId, setContactId] = useState<number | null>(null);

  const stakeholdersQuery = trpc.crm.accountContacts.listByCompany.useQuery({ companyId });
  const contactsQuery = trpc.crm.contacts.list.useQuery({});
  const utils = trpc.useUtils();

  const addMutation = trpc.crm.accountContacts.create.useMutation({
    onSuccess: () => {
      toast.success("Stakeholder adicionado!");
      setShowAdd(false);
      setRole("");
      setContactId(null);
      utils.crm.accountContacts.listByCompany.invalidate({ companyId });
    },
    onError: (error: any) => toast.error(`Erro: ${error.message}`),
  });

  const removeMutation = trpc.crm.accountContacts.delete.useMutation({
    onSuccess: () => {
      toast.success("Stakeholder removido!");
      utils.crm.accountContacts.listByCompany.invalidate({ companyId });
    },
    onError: (error: any) => toast.error(`Erro: ${error.message}`),
  });

  const stakeholders = stakeholdersQuery.data || [];
  const contacts = contactsQuery.data || [];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Stakeholders</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowAdd(!showAdd)} className="text-primary">
            <Plus className="w-4 h-4 mr-1" />{showAdd ? "Cancelar" : "Adicionar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAdd && (
          <div className="mb-4 p-3 bg-[#333333] rounded-lg space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Contato</label>
              <select value={contactId || ""} onChange={e => setContactId(Number(e.target.value))} className="w-full bg-[#222222] border border-border rounded px-3 py-2 text-foreground/80 mt-1 h-9 text-sm">
                <option value="">Selecione um contato...</option>
                {contacts.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nome} {c.cargo ? `(${c.cargo})` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Papel na Conta</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-[#222222] border border-border rounded px-3 py-2 text-foreground/80 mt-1 h-9 text-sm">
                <option value="">Selecione...</option>
                <option value="Decisor">Decisor</option>
                <option value="Influenciador">Influenciador</option>
                <option value="Campeão">Campeão</option>
                <option value="Usuário Final">Usuário Final</option>
                <option value="Técnico">Técnico</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90" disabled={!contactId || !role || addMutation.isPending} onClick={() => contactId && addMutation.mutate({ company_id: companyId, contact_id: contactId, papel: role as any })}>
              {addMutation.isPending ? <Loader className="w-3 h-3 animate-spin mr-1" /> : null}Adicionar
            </Button>
          </div>
        )}

        {stakeholders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum stakeholder vinculado</p>
        ) : (
          <div className="space-y-2">
            {stakeholders.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-2 bg-[#333333] rounded-lg">
                <div>
                  <p className="text-sm font-medium">{s.contact_name || `Contato #${s.contact_id}`}</p>
                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">{s.role}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => removeMutation.mutate({ id: s.id })}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// DEALS SECTION
// ============================================================================
function DealsSection({ companyId }: { companyId: number }) {
  const dealsQuery = trpc.crm.opportunities.list.useQuery({});
  const deals = (dealsQuery.data || []).filter((d: any) => d.company_id === companyId);

  const statusColors: Record<string, string> = {
    aberta: "bg-blue-900 text-blue-200",
    ganha: "bg-green-900 text-green-200",
    perdida: "bg-red-900 text-red-200",
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><Briefcase className="w-4 h-4" /> Deals ({deals.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum deal vinculado a esta conta</p>
        ) : (
          <div className="space-y-2">
            {deals.map((d: any) => (
              <Link key={d.id} href={`/pipeline`}>
                <div className="flex items-center justify-between p-3 bg-[#333333] rounded-lg hover:bg-[#444444] cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{d.titulo}</p>
                    <p className="text-xs text-muted-foreground">{d.estagio}</p>
                  </div>
                  <div className="text-right">
                    {d.valor && <p className="text-sm font-bold text-primary">R$ {Number(d.valor).toLocaleString("pt-BR")}</p>}
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColors[d.status] || "bg-[#444444]"}`}>{d.status}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// INLINE EDITABLE FIELD
// ============================================================================
function EditableField({ label, value, onSave, type = "text", options }: {
  label: string; value: string; onSave: (v: string) => void; type?: string;
  options?: { value: string; label: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        <div className="flex gap-1">
          {options ? (
            <select value={editValue} onChange={e => setEditValue(e.target.value)} className="flex-1 bg-[#222222] border border-border rounded px-2 py-1 text-sm text-foreground/80 h-8">
              <option value="">Selecione...</option>
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <Input value={editValue} onChange={e => setEditValue(e.target.value)} type={type} className="flex-1 bg-[#222222] border-border h-8 text-sm" autoFocus />
          )}
          <Button variant="ghost" size="sm" onClick={handleSave} className="text-green-400 h-8 w-8 p-0"><Check className="w-3 h-3" /></Button>
          <Button variant="ghost" size="sm" onClick={handleCancel} className="text-red-400 h-8 w-8 p-0"><X className="w-3 h-3" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer" onClick={() => { setEditValue(value); setEditing(true); }}>
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-1">
        <p className="text-sm font-medium">{value || <span className="text-muted-foreground italic">-</span>}</p>
        <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN ACCOUNT DETAIL PAGE
// ============================================================================
export default function ContaDetalhe() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const companyId = parseInt(params.id || "0");

  const companyQuery = trpc.crm.companies.getById.useQuery({ id: companyId }, { enabled: companyId > 0 });
  const company = companyQuery.data;
  const utils = trpc.useUtils();

  const updateMutation = trpc.crm.companies.update.useMutation({
    onSuccess: () => {
      toast.success("Campo atualizado!");
      utils.crm.companies.getById.invalidate({ id: companyId });
    },
    onError: (error: any) => toast.error(`Erro: ${error.message}`),
  });

  const updateField = (field: string, value: string) => {
    updateMutation.mutate({ id: companyId, [field]: value } as any);
  };

  if (companyQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Conta não encontrada</p>
        <Link href="/contas"><Button variant="outline" className="mt-4">Voltar</Button></Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    ativa: "bg-green-900 text-green-200",
    inativa: "bg-[#333333] text-foreground/80",
    prospect: "bg-purple-900 text-purple-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/contas">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Voltar</Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{company.nome}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[company.status] || "bg-[#333333]"}`}>
                  {company.status === "ativa" ? "Ativa" : company.status === "inativa" ? "Inativa" : "Prospect"}
                </span>
                {company.segmento && <span className="text-xs text-muted-foreground">{company.segmento}</span>}
                {company.cidade && <span className="text-xs text-muted-foreground">• {company.cidade}{company.estado ? `, ${company.estado}` : ""}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {company.website && (
            <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-border"><Globe className="w-4 h-4 mr-1" />Site</Button>
            </a>
          )}
          {company.linkedin && (
            <a href={company.linkedin.startsWith("http") ? company.linkedin : `https://${company.linkedin}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-border"><Linkedin className="w-4 h-4 mr-1" />LinkedIn</Button>
            </a>
          )}
        </div>
      </div>

      {/* Score Card */}
      <AccountScoreCard company={company} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Company Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dados da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <EditableField label="Nome" value={company.nome || ""} onSave={v => updateField("nome", v)} />
                <EditableField label="CNPJ" value={company.cnpj || ""} onSave={v => updateField("cnpj", v)} />
                <EditableField label="Email" value={company.email || ""} onSave={v => updateField("email", v)} type="email" />
                <EditableField label="Telefone" value={company.telefone || ""} onSave={v => updateField("telefone", v)} />
                <EditableField label="Website" value={company.website || ""} onSave={v => updateField("website", v)} />
                <EditableField label="LinkedIn" value={company.linkedin || ""} onSave={v => updateField("linkedin", v)} />
                <EditableField label="Segmento" value={company.segmento || ""} onSave={v => updateField("segmento", v)} />
                <EditableField label="Origem" value={company.lead_source || ""} onSave={v => updateField("lead_source", v)} />
                <EditableField label="Tamanho" value={company.tamanho || ""} onSave={v => updateField("tamanho", v)} options={[
                  { value: "micro", label: "Micro" }, { value: "pequena", label: "Pequena" },
                  { value: "media", label: "Média" }, { value: "grande", label: "Grande" },
                  { value: "multinacional", label: "Multinacional" },
                ]} />
                <EditableField label="Status" value={company.status || ""} onSave={v => updateField("status", v)} options={[
                  { value: "prospect", label: "Prospect" }, { value: "ativa", label: "Ativa" },
                  { value: "inativa", label: "Inativa" },
                ]} />
                <EditableField label="Receita Anual" value={company.receita_anual ? String(company.receita_anual) : ""} onSave={v => updateField("receita_anual", v)} type="number" />
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4" /> Endereço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <EditableField label="Endereço" value={company.endereco || ""} onSave={v => updateField("endereco", v)} />
                <EditableField label="Cidade" value={company.cidade || ""} onSave={v => updateField("cidade", v)} />
                <EditableField label="Estado" value={company.estado || ""} onSave={v => updateField("estado", v)} />
                <EditableField label="País" value={company.pais || ""} onSave={v => updateField("pais", v)} />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <EditableField label="" value={company.notes || ""} onSave={v => updateField("notes", v)} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stakeholders, Deals, Timeline */}
        <div className="space-y-6">
          <StakeholdersSection companyId={companyId} />
          <DealsSection companyId={companyId} />
        </div>
      </div>
    </div>
  );
}
