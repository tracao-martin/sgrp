import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Phone, Mail, Briefcase, Building2, Linkedin, Edit2, Check, X, Loader, ExternalLink, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useParams, useLocation } from "wouter";
import { ActivityTimeline } from "@/components/ActivityTimeline";

// ============================================================================
// CONTACT SCORE CARD
// ============================================================================
function ContactScoreCard({ contact }: { contact: any }) {
  const fields = [
    { key: "nome", label: "Nome" },
    { key: "email", label: "Email" },
    { key: "telefone", label: "Telefone" },
    { key: "cargo", label: "Cargo" },
    { key: "empresa", label: "Empresa" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "departamento", label: "Departamento" },
  ];

  const filled = fields.filter(f => contact[f.key] && String(contact[f.key]).trim() !== "");
  const missing = fields.filter(f => !contact[f.key] || String(contact[f.key]).trim() === "");
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
// INLINE EDITABLE FIELD
// ============================================================================
function EditableField({ label, value, onSave, type = "text", icon }: {
  label: string; value: string; onSave: (v: string) => void; type?: string; icon?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => { onSave(editValue); setEditing(false); };
  const handleCancel = () => { setEditValue(value); setEditing(false); };

  if (editing) {
    return (
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        <div className="flex gap-1">
          <Input value={editValue} onChange={e => setEditValue(e.target.value)} type={type} className="flex-1 bg-[#222222] border-border h-8 text-sm" autoFocus onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }} />
          <Button variant="ghost" size="sm" onClick={handleSave} className="text-green-400 h-8 w-8 p-0"><Check className="w-3 h-3" /></Button>
          <Button variant="ghost" size="sm" onClick={handleCancel} className="text-red-400 h-8 w-8 p-0"><X className="w-3 h-3" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer" onClick={() => { setEditValue(value); setEditing(true); }}>
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-medium">{value || <span className="text-muted-foreground italic">-</span>}</p>
        <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

// ============================================================================
// LINKED ACCOUNTS SECTION
// ============================================================================
function LinkedAccountsSection({ contactId }: { contactId: number }) {
  const stakeholdersQuery = trpc.crm.accountContacts.listByContact.useQuery({ contactId });
  const stakeholders = stakeholdersQuery.data || [];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4" /> Contas Vinculadas ({stakeholders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {stakeholders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma conta vinculada</p>
        ) : (
          <div className="space-y-2">
            {stakeholders.map((s: any) => (
              <Link key={s.id} href={`/contas/${s.company_id}`}>
                <div className="flex items-center justify-between p-3 bg-[#333333] rounded-lg hover:bg-[#444444] cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{s.company_name || `Conta #${s.company_id}`}</p>
                    <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">{s.papel || s.role || "Contato"}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
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
// MAIN CONTACT DETAIL PAGE
// ============================================================================
export default function ContatoDetalhe() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const contactId = parseInt(params.id || "0");

  const contactQuery = trpc.crm.contacts.getById.useQuery({ id: contactId }, { enabled: contactId > 0 });
  const contact = contactQuery.data;
  const utils = trpc.useUtils();

  const updateMutation = trpc.crm.contacts.update.useMutation({
    onSuccess: () => {
      toast.success("Campo atualizado!");
      utils.crm.contacts.getById.invalidate({ id: contactId });
    },
    onError: (error: any) => toast.error(`Erro: ${error.message}`),
  });

  const updateField = (field: string, value: string) => {
    updateMutation.mutate({ id: contactId, [field]: value } as any);
  };

  if (contactQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Contato não encontrado</p>
        <Link href="/contatos"><Button variant="outline" className="mt-4">Voltar</Button></Link>
      </div>
    );
  }

  const whatsappUrl = contact.telefone ? `https://wa.me/55${contact.telefone.replace(/\D/g, "")}` : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/contatos">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Voltar</Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{contact.nome}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {contact.cargo && <span className="text-sm text-muted-foreground">{contact.cargo}</span>}
                {contact.empresa && <span className="text-sm text-muted-foreground">• {contact.empresa}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-border text-green-400">
                <MessageCircle className="w-4 h-4 mr-1" />WhatsApp
              </Button>
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`}>
              <Button variant="outline" size="sm" className="border-border">
                <Mail className="w-4 h-4 mr-1" />Email
              </Button>
            </a>
          )}
          {contact.linkedin && (
            <a href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-border">
                <Linkedin className="w-4 h-4 mr-1" />LinkedIn
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Score Card */}
      <ContactScoreCard contact={contact} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact Data + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dados do Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <EditableField label="Nome" value={contact.nome || ""} onSave={v => updateField("nome", v)} icon={<User className="w-3 h-3 text-muted-foreground" />} />
                <EditableField label="Email" value={contact.email || ""} onSave={v => updateField("email", v)} type="email" icon={<Mail className="w-3 h-3 text-muted-foreground" />} />
                <EditableField label="Telefone" value={contact.telefone || ""} onSave={v => updateField("telefone", v)} icon={<Phone className="w-3 h-3 text-muted-foreground" />} />
                <EditableField label="Cargo" value={contact.cargo || ""} onSave={v => updateField("cargo", v)} icon={<Briefcase className="w-3 h-3 text-muted-foreground" />} />
                <EditableField label="Empresa" value={contact.empresa || ""} onSave={v => {}} icon={<Building2 className="w-3 h-3 text-muted-foreground" />} />
                <EditableField label="Departamento" value={contact.departamento || ""} onSave={v => updateField("departamento", v)} />
                <EditableField label="LinkedIn" value={contact.linkedin || ""} onSave={v => updateField("linkedin", v)} icon={<Linkedin className="w-3 h-3 text-muted-foreground" />} />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <EditableField label="" value={contact.notas || ""} onSave={v => updateField("notas", v)} />
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Timeline de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline contactId={contactId} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Linked Accounts */}
        <div className="space-y-6">
          <LinkedAccountsSection contactId={contactId} />
        </div>
      </div>
    </div>
  );
}
