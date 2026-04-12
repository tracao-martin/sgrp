import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader, Users, Download, Plus, Phone, Mail, Building2, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as XLSX from "xlsx";

// ============================================================================
// CREATE CONTACT DIALOG
// ============================================================================
function CreateContactDialog({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (v: boolean) => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    nome: "", email: "", telefone: "", cargo: "", company_id: 0,
    linkedin: "", departamento: "", notas: "",
  });

  const companiesQuery = trpc.crm.companies.list.useQuery({});
  const companies = companiesQuery.data || [];

  const createMutation = trpc.crm.contacts.create.useMutation({
    onSuccess: () => {
      toast.success("Contato criado com sucesso!");
      setFormData({ nome: "", email: "", telefone: "", cargo: "", company_id: 0, linkedin: "", departamento: "", notas: "" });
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: any) => toast.error(`Erro: ${error.message}`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    createMutation.mutate({ ...formData, company_id: Number(formData.company_id) || 0 } as any);
  };

  const updateField = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Contato</DialogTitle>
          <DialogDescription>Preencha os dados do contato</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Nome *</label>
              <Input placeholder="Ex: Roberto Silva" value={formData.nome} onChange={e => updateField("nome", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Cargo</label>
              <Input placeholder="Ex: Diretor de TI" value={formData.cargo} onChange={e => updateField("cargo", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Email</label>
              <Input type="email" placeholder="roberto@empresa.com" value={formData.email} onChange={e => updateField("email", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Telefone</label>
              <Input placeholder="(11) 98765-4321" value={formData.telefone} onChange={e => updateField("telefone", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Empresa</label>
              <select value={formData.company_id} onChange={e => updateField("company_id", e.target.value)} className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 h-9 text-sm">
                <option value={0}>Selecione...</option>
                {companies.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Departamento</label>
              <Input placeholder="Ex: Comercial" value={formData.departamento} onChange={e => updateField("departamento", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">LinkedIn</label>
            <Input placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={e => updateField("linkedin", e.target.value)} className="bg-[#333333] border-border mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Observações</label>
            <textarea placeholder="Notas sobre o contato..." value={formData.notas} onChange={e => updateField("notas", e.target.value)} className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 min-h-[60px] text-sm" />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">Cancelar</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={createMutation.isPending}>
              {createMutation.isPending ? <><Loader className="w-4 h-4 mr-2 animate-spin" />Criando...</> : "Criar Contato"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN CONTACTS PAGE
// ============================================================================
export default function Contatos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [filterCargo, setFilterCargo] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  const utils = trpc.useUtils();
  const contactsQuery = trpc.crm.contacts.list.useQuery({});
  const contacts = contactsQuery.data || [];

  // Derived data
  const uniqueCargos = useMemo(() => Array.from(new Set(contacts.map((c: any) => c.cargo).filter(Boolean))).sort(), [contacts]);
  const uniqueEmpresas = useMemo(() => Array.from(new Set(contacts.map((c: any) => c.empresa).filter(Boolean))).sort(), [contacts]);

  // Filter
  const filtered = useMemo(() => {
    return contacts.filter((c: any) => {
      const search = searchTerm.toLowerCase();
      const matchSearch = !search || c.nome?.toLowerCase().includes(search) || c.email?.toLowerCase().includes(search) || c.cargo?.toLowerCase().includes(search) || c.empresa?.toLowerCase().includes(search);
      const matchCargo = !filterCargo || c.cargo === filterCargo;
      const matchEmpresa = !filterEmpresa || c.empresa === filterEmpresa;
      return matchSearch && matchCargo && matchEmpresa;
    });
  }, [contacts, searchTerm, filterCargo, filterEmpresa]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const activeFilterCount = [filterCargo, filterEmpresa].filter(Boolean).length;

  const clearFilters = () => {
    setFilterCargo("");
    setFilterEmpresa("");
    setPage(1);
  };

  // Export
  const handleExport = () => {
    if (filtered.length === 0) { toast.error("Nenhum contato para exportar"); return; }
    const data = filtered.map((c: any) => ({
      Nome: c.nome || "", Email: c.email || "", Telefone: c.telefone || "",
      Cargo: c.cargo || "", Empresa: c.empresa || "", Departamento: c.departamento || "",
      LinkedIn: c.linkedin || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contatos");
    XLSX.writeFile(wb, `contatos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`${filtered.length} contatos exportados!`);
  };

  if (contactsQuery.isLoading) {
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
          <h1 className="text-3xl font-bold">Contatos</h1>
          <p className="text-muted-foreground mt-1">Gerenciamento de contatos e relacionamentos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />Novo Contato
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{contacts.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/30 rounded-lg"><Mail className="w-5 h-5 text-green-400" /></div>
              <div>
                <p className="text-2xl font-bold">{contacts.filter((c: any) => c.email).length}</p>
                <p className="text-xs text-muted-foreground">Com Email</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg"><Phone className="w-5 h-5 text-blue-400" /></div>
              <div>
                <p className="text-2xl font-bold">{contacts.filter((c: any) => c.telefone).length}</p>
                <p className="text-xs text-muted-foreground">Com Telefone</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900/30 rounded-lg"><Building2 className="w-5 h-5 text-purple-400" /></div>
              <div>
                <p className="text-2xl font-bold">{contacts.filter((c: any) => c.empresa).length}</p>
                <p className="text-xs text-muted-foreground">Com Empresa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, email, cargo ou empresa..." className="pl-10 bg-card border-border" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        <Button variant="outline" className={`border-border ${activeFilterCount > 0 ? "text-primary border-primary" : ""}`} onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-2" />Filtros{activeFilterCount > 0 && ` (${activeFilterCount})`}
        </Button>
      </div>

      {showFilters && (
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Cargo</label>
                <select value={filterCargo} onChange={e => { setFilterCargo(e.target.value); setPage(1); }} className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 h-9 text-sm">
                  <option value="">Todos</option>
                  {uniqueCargos.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Empresa</label>
                <select value={filterEmpresa} onChange={e => { setFilterEmpresa(e.target.value); setPage(1); }} className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 h-9 text-sm">
                  <option value="">Todas</option>
                  {uniqueEmpresas.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                    <X className="w-3 h-3 mr-1" />Limpar filtros
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{filtered.length} contatos encontrados</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {paginated.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nenhum contato encontrado</p>
              <p className="text-muted-foreground text-sm mt-1">Clique em "Novo Contato" para adicionar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Telefone</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Cargo</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Empresa</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((contato: any) => (
                    <tr key={contato.id} className="border-b border-border hover:bg-[#333333]/50">
                      <td className="py-3 px-4">
                        <Link href={`/contatos/${contato.id}`}>
                          <span className="font-medium text-primary hover:underline cursor-pointer">{contato.nome}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{contato.email || "-"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{contato.telefone || "-"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{contato.cargo || "-"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{contato.empresa || "-"}</td>
                      <td className="py-3 px-4">
                        <Link href={`/contatos/${contato.id}`}>
                          <Button variant="ghost" size="sm" className="text-primary"><Eye className="w-4 h-4" /></Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Exibindo {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} de {filtered.length}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} className="border-border">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page + i - 2;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p)} className={p === page ? "bg-primary" : "border-border"}>
                      {p}
                    </Button>
                  );
                })}
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="border-border">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateContactDialog open={showCreate} onOpenChange={setShowCreate} onSuccess={() => utils.crm.contacts.list.invalidate()} />
    </div>
  );
}
