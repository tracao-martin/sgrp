import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSGRPAuth } from "@/_core/hooks/useSGRPAuth";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  LogOut,
  Users,
  Building2,
  Contact,
  TrendingUp,
  CheckSquare,
  Calendar,
  BarChart3,
  DollarSign,
  Zap,
  Settings,
  Menu,
  X,
} from "lucide-react";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  badge?: number;
}

function MenuItem({ icon, label, href, isActive, badge }: MenuItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? "bg-blue-600 text-white"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      }`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {badge !== undefined && (
        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

interface SubmenuProps {
  label: string;
  icon: React.ReactNode;
  items: Array<{ label: string; href: string }>;
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
}

function Submenu({
  label,
  icon,
  items,
  isOpen,
  onToggle,
  currentPath,
}: SubmenuProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
      >
        <span className="w-5 h-5">{icon}</span>
        <span className="flex-1 text-sm font-medium text-left">{label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="mt-2 ml-4 space-y-1 border-l border-gray-700 pl-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded text-sm transition-colors ${
                currentPath === item.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SGRPLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin, isManagerOrAdmin } = useSGRPAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(
    location.startsWith("/configuracoes")
  );
  const { data: orgData } = trpc.auth.getOrganization.useQuery(undefined, {
    enabled: !!user,
  });

  if (!user) {
    return <>{children}</>;
  }

  const configItems = [
    { label: "Geral", href: "/configuracoes" },
    { label: "Funis", href: "/configuracoes/funis" },
    { label: "Probabilidade", href: "/configuracoes/probabilidade" },
    { label: "ICPs", href: "/configuracoes/icps" },
    { label: "Produtos", href: "/configuracoes/produtos" },
    { label: "Metas", href: "/configuracoes/metas" },
    { label: "Cadências", href: "/configuracoes/cadencias" },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } overflow-y-auto`}
      >
        {/* Logo + Org Name */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
              SG
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold">SGRP</h1>
                <p className="text-xs text-gray-500 truncate max-w-[160px]">
                  {orgData?.nome || "Receita Previsível"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {/* Main Menu */}
          <MenuItem
            icon={<TrendingUp className="w-5 h-5" />}
            label={sidebarOpen ? "Leads" : ""}
            href="/leads"
            isActive={location === "/leads"}
          />
          <MenuItem
            icon={<Building2 className="w-5 h-5" />}
            label={sidebarOpen ? "Contas" : ""}
            href="/contas"
            isActive={location === "/contas"}
          />
          <MenuItem
            icon={<Contact className="w-5 h-5" />}
            label={sidebarOpen ? "Contatos" : ""}
            href="/contatos"
            isActive={location === "/contatos"}
          />
          <MenuItem
            icon={<BarChart3 className="w-5 h-5" />}
            label={sidebarOpen ? "Funil de Vendas" : ""}
            href="/funil-vendas"
            isActive={location === "/funil-vendas"}
          />
          <MenuItem
            icon={<CheckSquare className="w-5 h-5" />}
            label={sidebarOpen ? "Tarefas" : ""}
            href="/tarefas"
            isActive={location === "/tarefas"}
            badge={3}
          />
          <MenuItem
            icon={<Calendar className="w-5 h-5" />}
            label={sidebarOpen ? "Calendário" : ""}
            href="/calendario"
            isActive={location === "/calendario"}
          />
          <MenuItem
            icon={<BarChart3 className="w-5 h-5" />}
            label={sidebarOpen ? "Dashboard" : ""}
            href="/dashboard"
            isActive={location === "/dashboard"}
          />
          <MenuItem
            icon={<DollarSign className="w-5 h-5" />}
            label={sidebarOpen ? "Previsão de Receita" : ""}
            href="/previsao-receita"
            isActive={location === "/previsao-receita"}
          />
          <MenuItem
            icon={<Zap className="w-5 h-5" />}
            label={sidebarOpen ? "Expert Comercial" : ""}
            href="/expert-comercial"
            isActive={location === "/expert-comercial"}
          />

          {/* Divider */}
          <div className="my-4 border-t border-gray-800" />

          {/* Settings Submenu */}
          {sidebarOpen && (
            <Submenu
              label="Configurações"
              icon={<Settings className="w-5 h-5" />}
              items={configItems}
              isOpen={configOpen}
              onToggle={() => setConfigOpen(!configOpen)}
              currentPath={location}
            />
          )}

          {/* Admin Menu */}
          {isAdmin() && sidebarOpen && (
            <>
              <div className="my-4 border-t border-gray-800" />
              <MenuItem
                icon={<Users className="w-5 h-5" />}
                label="Usuários"
                href="/admin/usuarios"
                isActive={location === "/admin/usuarios"}
              />
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name || "Usuário"}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role === "gerente"
                  ? "Gerente"
                  : user.role === "admin"
                    ? "Administrador"
                    : "Vendedor"}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold hover:bg-blue-700 transition-colors">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuItem className="text-gray-300 cursor-pointer hover:bg-gray-700">
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 cursor-pointer hover:bg-gray-700">
                  Preferências
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-red-400 cursor-pointer hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
