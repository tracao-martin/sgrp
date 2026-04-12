import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Loader, Users, Shield, ShieldCheck, UserCheck, UserX, UserPlus, Building2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const roleColors: Record<string, string> = {
  admin: "bg-red-900/60 text-red-200 border border-red-700",
  gerente: "bg-purple-900/60 text-purple-200 border border-purple-700",
  vendedor: "bg-blue-900/60 text-blue-200 border border-blue-700",
};

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  vendedor: "Vendedor",
};

export default function Usuarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState<any>(null);
  const [editRole, setEditRole] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"vendedor" | "gerente" | "admin">("vendedor");
  const [invitePassword, setInvitePassword] = useState("");

  const utils = trpc.useUtils();
  const usersQuery = trpc.crm.users.list.useQuery();
  const orgQuery = trpc.auth.getOrganization.useQuery();
  const users = usersQuery.data || [];
  const org = orgQuery.data;

  const updateRoleMutation = trpc.crm.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado!");
      utils.crm.users.list.invalidate();
      setEditUser(null);
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const toggleActiveMutation = trpc.crm.users.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.crm.users.list.invalidate();
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const inviteMutation = trpc.crm.users.invite.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      utils.crm.users.list.invalidate();
      setShowInvite(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("vendedor");
      setInvitePassword("");
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const filteredUsers = users.filter(
    (user: any) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsers = users.filter((u: any) => u.ativo).length;
  const admins = users.filter((u: any) => u.role === "admin").length;
  const gerentes = users.filter((u: any) => u.role === "gerente").length;
  const vendedores = users.filter((u: any) => u.role === "vendedor").length;
  const maxUsers = org?.maxUsuarios || 5;
  const usagePercent = Math.round((activeUsers / maxUsers) * 100);

  const openEditRole = (user: any) => {
    setEditUser(user);
    setEditRole(user.role);
  };

  const handleUpdateRole = () => {
    if (!editUser) return;
    updateRoleMutation.mutate({ userId: editUser.id, role: editRole as any });
  };

  const handleInvite = () => {
    if (!inviteName || !inviteEmail || !invitePassword) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    inviteMutation.mutate({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      tempPassword: invitePassword,
    });
  };

  if (usersQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-gray-400 mt-1">Gerenciamento de usuários e permissões</p>
        </div>
        <Button
          onClick={() => setShowInvite(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Org Limit Banner */}
      {org && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium">{org.nome}</p>
                  <p className="text-xs text-gray-400">
                    Plano: <span className="capitalize text-blue-300">{org.plano}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{activeUsers} / {maxUsers} usuários ativos</p>
                  <div className="w-40 h-2 bg-gray-700 rounded-full mt-1">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        usagePercent >= 90 ? "bg-red-500" : usagePercent >= 70 ? "bg-yellow-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-900/30 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{admins}</p>
                <p className="text-xs text-gray-400">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{gerentes}</p>
                <p className="text-xs text-gray-400">Gerentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <UserCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vendedores}</p>
                <p className="text-xs text-gray-400">Vendedores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar por nome ou email..."
            className="pl-10 bg-gray-800 border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>{filteredUsers.length} usuários encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Nenhum usuário encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Clique em "Novo Usuário" para adicionar membros à equipe</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Perfil</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Departamento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Último Acesso</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <p className="font-medium">{user.name || "Sem nome"}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{user.email || "-"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || "bg-gray-700 text-gray-300"}`}>
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{user.departamento || "-"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.ativo ? "bg-green-900/60 text-green-200" : "bg-red-900/60 text-red-200"}`}>
                          {user.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleString("pt-BR") : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditRole(user)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Alterar perfil"
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActiveMutation.mutate({ userId: user.id })}
                            className={user.ativo ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}
                            title={user.ativo ? "Desativar" : "Ativar"}
                          >
                            {user.ativo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
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

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar Perfil de {editUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-gray-300">Perfil</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-300"
              >
                <option value="vendedor">Vendedor</option>
                <option value="gerente">Gerente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <Button variant="outline" onClick={() => setEditUser(null)} className="border-gray-600">
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateRole}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-gray-300">Nome completo *</label>
              <Input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Ex: João Silva"
                className="mt-1 bg-gray-700 border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Email *</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="joao@empresa.com.br"
                className="mt-1 bg-gray-700 border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Senha temporária *</label>
              <Input
                type="text"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="mt-1 bg-gray-700 border-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">O usuário poderá alterar a senha depois</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Perfil</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-300"
              >
                <option value="vendedor">Vendedor</option>
                <option value="gerente">Gerente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {activeUsers >= maxUsers && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-sm text-red-200">
                Limite de {maxUsers} usuários ativos atingido. Desative um usuário existente ou entre em contato para upgrade do plano.
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <Button variant="outline" onClick={() => setShowInvite(false)} className="border-gray-600">
                Cancelar
              </Button>
              <Button
                onClick={handleInvite}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={inviteMutation.isPending || activeUsers >= maxUsers}
              >
                {inviteMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Criar Usuário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
