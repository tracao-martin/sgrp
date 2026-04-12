import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useSGRPAuth } from "@/_core/hooks/useSGRPAuth";
import { Loader, Settings, Layers, Target, Users, Mail, Bell, Building2, Save, Lock } from "lucide-react";
import { toast } from "sonner";

export default function Configuracoes() {
  const { isAdmin } = useSGRPAuth();
  const stagesQuery = trpc.crm.pipelineStages.list.useQuery();
  const orgQuery = trpc.auth.getOrganization.useQuery();
  const stages = stagesQuery.data || [];
  const org = orgQuery.data;

  const [editOrg, setEditOrg] = useState(false);
  const [orgNome, setOrgNome] = useState("");
  const [orgCnpj, setOrgCnpj] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgTelefone, setOrgTelefone] = useState("");

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const utils = trpc.useUtils();

  const updateOrgMutation = trpc.auth.updateOrganization.useMutation({
    onSuccess: () => {
      toast.success("Organização atualizada!");
      utils.auth.getOrganization.invalidate();
      setEditOrg(false);
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const openEditOrg = () => {
    if (org) {
      setOrgNome(org.nome || "");
      setOrgCnpj(org.cnpj || "");
      setOrgEmail(org.email || "");
      setOrgTelefone(org.telefone || "");
    }
    setEditOrg(true);
  };

  const handleSaveOrg = () => {
    updateOrgMutation.mutate({
      nome: orgNome || undefined,
      cnpj: orgCnpj || undefined,
      email: orgEmail || undefined,
      telefone: orgTelefone || undefined,
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const planLabels: Record<string, string> = {
    trial: "Trial (14 dias)",
    basico: "Básico",
    profissional: "Profissional",
    enterprise: "Enterprise",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Minha Organização */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <CardTitle>Minha Organização</CardTitle>
              </div>
              {isAdmin() && (
                <Button variant="outline" size="sm" onClick={openEditOrg} className="border-border">
                  Editar
                </Button>
              )}
            </div>
            <CardDescription>Dados da sua organização</CardDescription>
          </CardHeader>
          <CardContent>
            {orgQuery.isLoading ? (
              <div className="flex justify-center py-4">
                <Loader className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : org ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[#333333]/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Nome</p>
                  <p className="font-medium">{org.nome}</p>
                </div>
                <div className="p-4 bg-[#333333]/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">CNPJ</p>
                  <p className="font-medium">{org.cnpj || "Não informado"}</p>
                </div>
                <div className="p-4 bg-[#333333]/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Plano</p>
                  <p className="font-medium capitalize text-primary">{planLabels[org.plano] || org.plano}</p>
                </div>
                <div className="p-4 bg-[#333333]/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Limite de Usuários</p>
                  <p className="font-medium">{org.maxUsuarios}</p>
                </div>
                {org.email && (
                  <div className="p-4 bg-[#333333]/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{org.email}</p>
                  </div>
                )}
                {org.telefone && (
                  <div className="p-4 bg-[#333333]/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                    <p className="font-medium">{org.telefone}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Organização não encontrada</p>
            )}
          </CardContent>
        </Card>

        {/* Minha Conta */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-yellow-400" />
              <CardTitle>Minha Conta</CardTitle>
            </div>
            <CardDescription>Segurança e credenciais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-border"
                onClick={() => setShowPasswordDialog(true)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Stages */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <CardTitle>Estágios do Pipeline</CardTitle>
            </div>
            <CardDescription>Estágios do funil de vendas da sua organização</CardDescription>
          </CardHeader>
          <CardContent>
            {stagesQuery.isLoading ? (
              <div className="flex justify-center py-4">
                <Loader className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {stages.map((stage: any, idx: number) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-3 bg-[#333333]/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.cor || "#6B7280" }}
                      />
                      <span className="font-medium">{stage.nome}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stage.probabilidadeFechamento || 0}%
                    </span>
                  </div>
                ))}
                {stages.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Nenhum estágio configurado</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Perfis de Acesso */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <CardTitle>Perfis de Acesso</CardTitle>
            </div>
            <CardDescription>Permissões por tipo de usuário</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { role: "Administrador", permissions: "Acesso total ao sistema, gerenciar org e usuários", color: "text-red-400" },
                { role: "Gerente", permissions: "Gerenciar equipe, relatórios, configurações", color: "text-yellow-400" },
                { role: "Vendedor", permissions: "Gerenciar leads, deals, atividades próprias", color: "text-primary" },
              ].map((item) => (
                <div key={item.role} className="p-3 bg-[#333333]/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${item.color}`}>{item.role}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.permissions}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>Configurações de alertas e notificações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Tarefa vencida", desc: "Notificar quando uma tarefa passar da data", active: true },
                { label: "Novo lead", desc: "Notificar quando um novo lead for criado", active: true },
                { label: "Deal movido", desc: "Notificar quando um deal mudar de estágio", active: false },
                { label: "Meta atingida", desc: "Notificar quando a meta mensal for atingida", active: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-[#333333]/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full ${item.active ? "bg-primary" : "bg-[#444444]"} relative cursor-pointer`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${item.active ? "left-5" : "left-0.5"}`} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground text-center mt-2">Notificações serão implementadas em breve</p>
            </div>
          </CardContent>
        </Card>

        {/* Integrações */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <CardTitle>Integrações</CardTitle>
            </div>
            <CardDescription>Conecte com ferramentas externas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Google Calendar", desc: "Sincronize reuniões e agendamentos", status: "Em breve" },
                { name: "Email (SMTP)", desc: "Envie emails automáticos", status: "Em breve" },
                { name: "WhatsApp API", desc: "Integre com WhatsApp Business", status: "Em breve" },
                { name: "Webhook", desc: "Receba notificações externas", status: "Em breve" },
                { name: "Importação CSV", desc: "Importe leads e contatos", status: "Em breve" },
                { name: "API REST", desc: "Acesse dados via API", status: "Em breve" },
              ].map((item) => (
                <div key={item.name} className="p-4 bg-[#333333]/50 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-yellow-900/50 text-yellow-300 rounded">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Organization Dialog */}
      <Dialog open={editOrg} onOpenChange={setEditOrg}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Organização</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground/80">Nome da Organização</label>
              <Input
                value={orgNome}
                onChange={(e) => setOrgNome(e.target.value)}
                className="mt-1 bg-[#333333] border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">CNPJ</label>
              <Input
                value={orgCnpj}
                onChange={(e) => setOrgCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                className="mt-1 bg-[#333333] border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Email</label>
              <Input
                type="email"
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
                className="mt-1 bg-[#333333] border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Telefone</label>
              <Input
                value={orgTelefone}
                onChange={(e) => setOrgTelefone(e.target.value)}
                className="mt-1 bg-[#333333] border-border"
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setEditOrg(false)} className="border-border">
                Cancelar
              </Button>
              <Button
                onClick={handleSaveOrg}
                className="bg-primary hover:bg-primary/90"
                disabled={updateOrgMutation.isPending}
              >
                {updateOrgMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground/80">Senha Atual</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 bg-[#333333] border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Nova Senha</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="mt-1 bg-[#333333] border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Confirmar Nova Senha</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 bg-[#333333] border-border"
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="border-border">
                Cancelar
              </Button>
              <Button
                onClick={handleChangePassword}
                className="bg-primary hover:bg-primary/90"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                Alterar Senha
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
