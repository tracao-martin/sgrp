import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader, Users, ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ContatoModal } from "@/components/ContatoModal";
import { ContatoActions } from "@/components/ContatoActions";
import { ActivityTimeline } from "@/components/ActivityTimeline";

export default function Contatos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedContactId, setExpandedContactId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const contactsQuery = trpc.crm.contacts.list.useQuery();
  const contacts = contactsQuery.data || [];

  const filteredContatos = contacts.filter(
    (contato: any) =>
      contato.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contato.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contato.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTimeline = (contactId: number) => {
    setExpandedContactId(expandedContactId === contactId ? null : contactId);
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
        <ContatoModal onSuccess={() => contactsQuery.refetch()} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{contacts.length}</p>
                <p className="text-xs text-muted-foreground">Total de Contatos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/30 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{contacts.filter((c: any) => c.cargo).length}</p>
                <p className="text-xs text-muted-foreground">Com Cargo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900/30 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{contacts.filter((c: any) => c.email).length}</p>
                <p className="text-xs text-muted-foreground">Com Email</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou cargo..."
            className="pl-10 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Lista de Contatos</CardTitle>
          <CardDescription>{filteredContatos.length} contatos encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredContatos.length === 0 ? (
            <div className="text-center py-8">
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
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Timeline</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground/80">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContatos.map((contato: any) => (
                    <React.Fragment key={contato.id}>
                      <tr className="border-b border-border hover:bg-[#333333]/50">
                        <td className="py-3 px-4">
                          <p className="font-medium">{contato.nome}</p>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{contato.email || "-"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{contato.telefone || "-"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{contato.cargo || "-"}</td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTimeline(contato.id)}
                            className="text-primary hover:text-primary"
                          >
                            {expandedContactId === contato.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </td>
                        <td className="py-3 px-4">
                          <ContatoActions contato={contato} onSuccess={() => contactsQuery.refetch()} />
                        </td>
                      </tr>
                      {expandedContactId === contato.id && (
                        <tr>
                          <td colSpan={6} className="p-4 bg-[#1c1c1c]/50">
                            <ActivityTimeline contactId={contato.id} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
