import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Loader, Download, Building2, ChevronLeft, ChevronRight, ExternalLink, X, Eye, Edit, Trash2, Globe, Linkedin } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";
import * as XLSX from "xlsx";

const statusColors: Record<string, string> = {
  ativa: "bg-green-900 text-green-200",
  inativa: "bg-[#333333] text-foreground/80",
  prospect: "bg-purple-900 text-purple-200",
};

const statusLabels: Record<string, string> = {
  ativa: "Ativa",
  inativa: "Inativa",
  prospect: "Prospect",
};

const tamanhoLabels: Record<string, string> = {
  micro: "Micro",
  pequena: "Pequena",
  media: "Média",
  grande: "Grande",
  multinacional: "Multinacional",
};

const accountTypeLabels: Record<string, string> = {
  cliente_ativo: "Cliente Ativo",
  cliente_inativo: "Cliente Inativo",
  prospect: "Prospect",
};

interface ContaFormData {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  website: string;
  endereco: string;
  cidade: string;
  estado: string;
  pais: string;
  segmento: string;
  tamanho: string;
  receita_anual: string;
  status: string;
  site: string;
  linkedin: string;
  notes: string;
  lead_source: string;
}

const emptyForm: ContaFormData = {
  nome: "", cnpj: "", email: "", telefone: "", website: "", endereco: "",
  cidade: "", estado: "", pais: "", segmento: "", tamanho: "pequena",
  receita_anual: "", status: "prospect", site: "", linkedin: "", notes: "", lead_source: "",
};

// ============================================================================
// CONTA FORM DIALOG
// ============================================================================
function ContaFormDialog({ 
  open, onOpenChange, initialData, mode, onSuccess 
}: { 
  open: boolean; 
  onOpenChange: (v: boolean) => void; 
  initialData?: ContaFormData; 
  mode: "create" | "edit"; 
  onSuccess: () => void;
  editId?: number;
}) {
  const [formData, setFormData] = useState<ContaFormData>(initialData || emptyForm);
  const utils = trpc.useUtils();

  const createMutation = trpc.crm.companies.create.useMutation({
    onSuccess: () => {
      toast.success("Conta criada com sucesso!");
      onOpenChange(false);
      utils.crm.companies.list.invalidate();
      onSuccess();
    },
    onError: (error: any) => toast.error(`Erro: ${error.message}`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    createMutation.mutate({
      ...formData,
      receita_anual: formData.receita_anual ? parseInt(formData.receita_anual) : undefined,
    } as any);
  };

  const set = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nova Conta" : "Editar Conta"}</DialogTitle>
          <DialogDescription>Preencha os dados da empresa</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Nome da Empresa *</label>
              <Input placeholder="Ex: Acme Corporation" value={formData.nome} onChange={e => set("nome", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">CNPJ</label>
              <Input placeholder="00.000.000/0000-00" value={formData.cnpj} onChange={e => set("cnpj", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Email</label>
              <Input type="email" placeholder="contato@empresa.com" value={formData.email} onChange={e => set("email", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Telefone</label>
              <Input placeholder="(11) 98765-4321" value={formData.telefone} onChange={e => set("telefone", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Website</label>
              <Input placeholder="https://empresa.com" value={formData.website} onChange={e => set("website", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">LinkedIn</label>
              <Input placeholder="https://linkedin.com/company/..." value={formData.linkedin} onChange={e => set("linkedin", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Segmento</label>
              <Input placeholder="Ex: Tecnologia" value={formData.segmento} onChange={e => set("segmento", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Origem</label>
              <select value={formData.lead_source} onChange={e => set("lead_source", e.target.value)} className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 h-9">
                <option value="">Selecione...</option>
                <option value="Indicação">Indicação</option>
                <option value="Site">Site</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Evento">Evento</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Cidade</label>
              <Input placeholder="São Paulo" value={formData.cidade} onChange={e => set("cidade", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Estado</label>
              <Input placeholder="SP" maxLength={2} value={formData.estado} onChange={e => set("estado", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">País</label>
              <Input placeholder="Brasil" value={formData.pais} onChange={e => set("pais", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Tamanho</label>
              <select value={formData.tamanho} onChange={e => set("tamanho", e.target.value)} className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 h-9">
                <option value="micro">Micro</option>
                <option value="pequena">Pequena</option>
                <option value="media">Média</option>
                <option value="grande">Grande</option>
                <option value="multinacional">Multinacional</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Receita Anual (R$)</label>
              <Input type="number" placeholder="1000000" value={formData.receita_anual} onChange={e => set("receita_anual", e.target.value)} className="bg-[#333333] border-border mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Status</label>
              <select value={formData.status} onChange={e => set("status", e.target.value)} className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 h-9">
                <option value="prospect">Prospect</option>
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Observações</label>
            <textarea placeholder="Notas sobre a empresa..." value={formData.notes} onChange={e => set("notes", e.target.value)} className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 min-h-[80px]" />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">Cancelar</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={createMutation.isPending}>
              {createMutation.isPending ? <><Loader className="w-4 h-4 mr-2 animate-spin" />Criando...</> : "Criar Conta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN CONTAS PAGE
// ============================================================================
export default function Contas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTamanho, setFilterTamanho] = useState("");
  const [filterSegmento, setFilterSegmento] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editConta, setEditConta] = useState<any>(null);
  const [deleteConta, setDeleteConta] = useState<any>(null);

  const companiesQuery = trpc.crm.companies.list.useQuery({ limit: 500 });
  const companies = companiesQuery.data || [];
  const utils = trpc.useUtils();

  const deleteMutation = trpc.crm.companies.delete.useMutation({
    onSuccess: () => {
      toast.success("Conta excluída com sucesso!");
      setDeleteConta(null);
      utils.crm.companies.list.invalidate();
    },
    onError: (error: any) => toast.error(`Erro: ${error.message}`),
  });

  const updateMutation = trpc.crm.companies.update.useMutation({
    onSuccess: () => {
      toast.success("Conta atualizada com sucesso!");
      setEditConta(null);
      utils.crm.companies.list.invalidate();
    },
    onError: (error: any) => toast.error(`Erro: ${error.message}`),
  });

  const activeFilters = [filterStatus, filterTamanho, filterSegmento].filter(Boolean).length;

  const filtered = useMemo(() => {
    return companies.filter((c: any) => {
      if (searchTerm && !c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) && !c.cnpj?.includes(searchTerm) && !c.email?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      if (filterTamanho && c.tamanho !== filterTamanho) return false;
      if (filterSegmento && !c.segmento?.toLowerCase().includes(filterSegmento.toLowerCase())) return false;
      return true;
    });
  }, [companies, searchTerm, filterStatus, filterTamanho, filterSegmento]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleExport = () => {
    if (filtered.length === 0) { toast.error("Nenhuma conta para exportar"); return; }
    const data = filtered.map((c: any) => ({
      Nome: c.nome, CNPJ: c.cnpj || "", Email: c.email || "", Telefone: c.telefone || "",
      Website: c.website || "", Segmento: c.segmento || "", Cidade: c.cidade || "",
      Estado: c.estado || "", Tamanho: c.tamanho || "", Status: c.status || "",
      "Receita Anual": c.receita_anual || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contas");
    XLSX.writeFile(wb, `contas_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`${filtered.length} contas exportadas com sucesso!`);
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterTamanho("");
    setFilterSegmento("");
    setPage(1);
  };

  if (companiesQuery.isLoading) {
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
          <h1 className="text-3xl font-bold">Contas</h1>
          <p className="text-muted-foreground mt-1">Gerenciamento de contas e empresas ({companies.length} total)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />Nova Conta
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, CNPJ ou email..." className="pl-10 bg-card border-border" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        <Button variant="outline" className={`border-border ${showFilters ? "bg-primary/20" : ""}`} onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-2" />Filtros {activeFilters > 0 && <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">{activeFilters}</span>}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/80">Status</label>
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 h-9">
                  <option value="">Todos</option>
                  <option value="ativa">Ativa</option>
                  <option value="inativa">Inativa</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80">Tamanho</label>
                <select value={filterTamanho} onChange={e => { setFilterTamanho(e.target.value); setPage(1); }} className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 h-9">
                  <option value="">Todos</option>
                  <option value="micro">Micro</option>
                  <option value="pequena">Pequena</option>
                  <option value="media">Média</option>
                  <option value="grande">Grande</option>
                  <option value="multinacional">Multinacional</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80">Segmento</label>
                <Input placeholder="Ex: Tecnologia" value={filterSegmento} onChange={e => { setFilterSegmento(e.target.value); setPage(1); }} className="bg-[#333333] border-border mt-1" />
              </div>
            </div>
            {activeFilters > 0 && (
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="w-3 h-3 mr-1" />Limpar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Lista de Contas</CardTitle>
          <CardDescription>Exibindo {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} de {filtered.length} contas</CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Nenhuma conta encontrada</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground/80">Empresa</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground/80">CNPJ</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground/80">Contato</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground/80">Segmento</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground/80">Tamanho</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground/80">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground/80">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((conta: any) => (
                      <tr key={conta.id} className="border-b border-border hover:bg-[#333333]/50 cursor-pointer">
                        <td className="py-3 px-4">
                          <Link href={`/contas/${conta.id}`} className="hover:text-primary">
                            <p className="font-medium">{conta.nome}</p>
                            {conta.cidade && <p className="text-xs text-muted-foreground">{conta.cidade}{conta.estado ? `, ${conta.estado}` : ""}</p>}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{conta.cnpj || "-"}</td>
                        <td className="py-3 px-4">
                          <div className="text-xs">
                            {conta.email && <p className="text-muted-foreground">{conta.email}</p>}
                            {conta.telefone && <p className="text-muted-foreground">{conta.telefone}</p>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{conta.segmento || "-"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{tamanhoLabels[conta.tamanho] || "-"}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[conta.status] || "bg-[#333333] text-foreground/80"}`}>
                            {statusLabels[conta.status] || conta.status || "Prospect"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Link href={`/contas/${conta.id}`}>
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary"><Eye className="w-4 h-4" /></Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300" onClick={(e) => { e.stopPropagation(); setEditConta(conta); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); setDeleteConta(conta); }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Página {page} de {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="border-border">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="border-border">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <ContaFormDialog open={showCreateModal} onOpenChange={setShowCreateModal} mode="create" onSuccess={() => companiesQuery.refetch()} />

      {/* Edit Modal */}
      {editConta && (
        <Dialog open={!!editConta} onOpenChange={() => setEditConta(null)}>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Conta</DialogTitle>
              <DialogDescription>Atualize os dados de {editConta.nome}</DialogDescription>
            </DialogHeader>
            <EditContaForm conta={editConta} onSuccess={() => { setEditConta(null); utils.crm.companies.list.invalidate(); }} onCancel={() => setEditConta(null)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirm */}
      {deleteConta && (
        <Dialog open={!!deleteConta} onOpenChange={() => setDeleteConta(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Excluir Conta</DialogTitle>
              <DialogDescription>Tem certeza que deseja excluir "{deleteConta.nome}"? Esta ação não pode ser desfeita.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setDeleteConta(null)} className="border-border">Cancelar</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate({ id: deleteConta.id })} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}Excluir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ============================================================================
// EDIT FORM (inline)
// ============================================================================
function EditContaForm({ conta, onSuccess, onCancel }: { conta: any; onSuccess: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    nome: conta.nome || "", cnpj: conta.cnpj || "", email: conta.email || "",
    telefone: conta.telefone || "", website: conta.website || "", endereco: conta.endereco || "",
    cidade: conta.cidade || "", estado: conta.estado || "", pais: conta.pais || "",
    segmento: conta.segmento || "", tamanho: conta.tamanho || "pequena",
    receita_anual: conta.receita_anual || "", status: conta.status || "prospect",
    site: conta.site || "", linkedin: conta.linkedin || "", notes: conta.notes || "",
    lead_source: conta.lead_source || "",
  });

  const updateMutation = trpc.crm.companies.update.useMutation({
    onSuccess: () => { toast.success("Conta atualizada!"); onSuccess(); },
    onError: (error: any) => toast.error(`Erro: ${error.message}`),
  });

  const set = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: conta.id,
      ...formData,
      receita_anual: formData.receita_anual ? parseInt(formData.receita_anual) : undefined,
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground/80">Nome *</label>
          <Input value={formData.nome} onChange={e => set("nome", e.target.value)} className="bg-[#333333] border-border mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground/80">CNPJ</label>
          <Input value={formData.cnpj} onChange={e => set("cnpj", e.target.value)} className="bg-[#333333] border-border mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground/80">Email</label>
          <Input value={formData.email} onChange={e => set("email", e.target.value)} className="bg-[#333333] border-border mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground/80">Telefone</label>
          <Input value={formData.telefone} onChange={e => set("telefone", e.target.value)} className="bg-[#333333] border-border mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground/80">Website</label>
          <Input value={formData.website} onChange={e => set("website", e.target.value)} className="bg-[#333333] border-border mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground/80">LinkedIn</label>
          <Input value={formData.linkedin} onChange={e => set("linkedin", e.target.value)} className="bg-[#333333] border-border mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground/80">Segmento</label>
          <Input value={formData.segmento} onChange={e => set("segmento", e.target.value)} className="bg-[#333333] border-border mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground/80">Tamanho</label>
          <select value={formData.tamanho} onChange={e => set("tamanho", e.target.value)} className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 h-9">
            <option value="micro">Micro</option>
            <option value="pequena">Pequena</option>
            <option value="media">Média</option>
            <option value="grande">Grande</option>
            <option value="multinacional">Multinacional</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground/80">Status</label>
          <select value={formData.status} onChange={e => set("status", e.target.value)} className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 h-9">
            <option value="prospect">Prospect</option>
            <option value="ativa">Ativa</option>
            <option value="inativa">Inativa</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground/80">Observações</label>
        <textarea value={formData.notes} onChange={e => set("notes", e.target.value)} className="w-full bg-[#333333] border border-border rounded px-3 py-2 text-foreground/80 mt-1 min-h-[80px]" />
      </div>
      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} className="border-border">Cancelar</Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}Atualizar
        </Button>
      </div>
    </form>
  );
}
