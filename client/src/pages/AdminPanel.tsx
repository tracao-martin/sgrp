import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSGRPAuth } from "@/_core/hooks/useSGRPAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Building2, Users, TrendingUp, BarChart3, Shield, Eye, EyeOff,
  KeyRound, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Loader,
} from "lucide-react";

// ─── Role Badge ───────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  superadmin: "bg-red-500/20 text-red-400 border-red-500/30",
  admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  gerente: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  vendedor: "bg-green-500/20 text-green-400 border-green-500/30",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_COLORS[role] || "bg-muted text-muted-foreground"}`}>
      {role}
    </span>
  );
}

// ─── Reset Password Dialog ────────────────────────────────────────────────────

function ResetPasswordDialog({ userId, email, open, onClose }: {
  userId: number; email: string; open: boolean; onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const utils = trpc.useUtils();

  const resetMutation = trpc.admin.users.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Senha redefinida com sucesso!");
      setPassword("");
      onClose();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle>Redefinir Senha</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{email}</p>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nova senha (mín. 6 caracteres)"
            className="w-full bg-[#333] border border-border rounded-md px-3 py-2 text-sm pr-10 focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">Cancelar</Button>
          <Button
            onClick={() => resetMutation.mutate({ userId, newPassword: password })}
            disabled={resetMutation.isPending || password.length < 6}
            className="bg-primary hover:bg-primary/90"
          >
            {resetMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
            Redefinir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────

function StatsOverview() {
  const { data, isLoading } = trpc.admin.stats.overview.useQuery();

  const cards = [
    { label: "Organizações", value: data?.organizacoes, icon: Building2, color: "text-purple-400" },
    { label: "Usuários", value: data?.usuarios, icon: Users, color: "text-blue-400" },
    { label: "Empresas", value: data?.empresas, icon: Building2, color: "text-green-400" },
    { label: "Leads", value: data?.leads, icon: TrendingUp, color: "text-yellow-400" },
    { label: "Oportunidades", value: data?.oportunidades, icon: BarChart3, color: "text-orange-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${c.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="text-2xl font-bold">{isLoading ? "—" : c.value ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Organizations Table ──────────────────────────────────────────────────────

function OrganizationsTable() {
  const { data = [], isLoading } = trpc.admin.organizations.list.useQuery();

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> Organizações ({data.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 pr-4">Nome</th>
                  <th className="text-left py-2 pr-4">Plano</th>
                  <th className="text-center py-2 pr-4">Usuários</th>
                  <th className="text-center py-2 pr-4">Empresas</th>
                  <th className="text-center py-2 pr-4">Oport.</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((org: any) => (
                  <tr key={org.id} className="border-b border-border/50 hover:bg-[#333]/30">
                    <td className="py-2 pr-4 font-medium">{org.nome}</td>
                    <td className="py-2 pr-4">
                      <RoleBadge role={org.plano} />
                    </td>
                    <td className="py-2 pr-4 text-center">{org.totalUsuarios}</td>
                    <td className="py-2 pr-4 text-center">{org.totalEmpresas}</td>
                    <td className="py-2 pr-4 text-center">{org.totalOportunidades}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${org.ativo ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                        {org.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Users Table ──────────────────────────────────────────────────────────────

function UsersTable() {
  const { data = [], isLoading, refetch } = trpc.admin.users.list.useQuery();
  const [resetTarget, setResetTarget] = useState<{ id: number; email: string } | null>(null);
  const [showHashes, setShowHashes] = useState(false);

  const updateRoleMutation = trpc.admin.users.updateRole.useMutation({
    onSuccess: () => { toast.success("Role atualizada!"); refetch(); },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const toggleAtivoMutation = trpc.admin.users.toggleAtivo.useMutation({
    onSuccess: () => { toast.success("Status atualizado!"); refetch(); },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const ROLES = ["superadmin", "admin", "gerente", "vendedor"] as const;

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Usuários ({data.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-xs gap-1"
              onClick={() => setShowHashes(!showHashes)}
            >
              {showHashes ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showHashes ? "Ocultar hashes" : "Ver hashes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6"><Loader className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">Usuário</th>
                    <th className="text-left py-2 pr-4">Organização</th>
                    <th className="text-left py-2 pr-4">Role</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    {showHashes && <th className="text-left py-2 pr-4">Password Hash</th>}
                    <th className="text-left py-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((u: any) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-[#333]/30">
                      <td className="py-2 pr-4">
                        <div>
                          <p className="font-medium">{u.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground text-xs">{u.organizacaoNome || "—"}</td>
                      <td className="py-2 pr-4">
                        <select
                          value={u.role}
                          onChange={(e) => updateRoleMutation.mutate({ userId: u.id, role: e.target.value as any })}
                          className="bg-[#333] border border-border rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-4">
                        <button
                          onClick={() => toggleAtivoMutation.mutate({ userId: u.id, ativo: !u.ativo })}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ${
                            u.ativo
                              ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30"
                          }`}
                        >
                          {u.ativo ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                          {u.ativo ? "Ativo" : "Inativo"}
                        </button>
                      </td>
                      {showHashes && (
                        <td className="py-2 pr-4">
                          <code className="text-[10px] text-muted-foreground bg-[#222] px-1 rounded break-all max-w-[200px] block truncate">
                            {u.passwordHash}
                          </code>
                        </td>
                      )}
                      <td className="py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                          onClick={() => setResetTarget({ id: u.id, email: u.email })}
                        >
                          <KeyRound className="w-3 h-3" /> Senha
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {resetTarget && (
        <ResetPasswordDialog
          userId={resetTarget.id}
          email={resetTarget.email}
          open={!!resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "overview" | "organizations" | "users";

export default function AdminPanel() {
  const { isSuperAdmin } = useSGRPAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");

  if (!isSuperAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Shield className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Acesso restrito a superadmins.</p>
        <Button variant="outline" onClick={() => setLocation("/dashboard")}>Voltar</Button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Visão Geral", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "organizations", label: "Organizações", icon: <Building2 className="w-4 h-4" /> },
    { id: "users", label: "Usuários", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-red-400" />
        <div>
          <h1 className="text-2xl font-bold">Painel Super Admin</h1>
          <p className="text-sm text-muted-foreground">Gestão cross-tenant de organizações e usuários</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "overview" && (
        <div className="space-y-6">
          <StatsOverview />
          <OrganizationsTable />
        </div>
      )}
      {tab === "organizations" && <OrganizationsTable />}
      {tab === "users" && <UsersTable />}
    </div>
  );
}
