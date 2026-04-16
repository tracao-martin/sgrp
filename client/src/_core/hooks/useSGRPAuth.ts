import { useAuth } from "./useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export type UserRole = "superadmin" | "admin" | "gerente" | "vendedor";

export interface SGRPUser {
  id: number;
  name: string | null;
  email: string;
  role: UserRole;
  departamento: string | null;
  ativo: boolean;
}

/**
 * Hook personalizado para autenticação e controle de perfil do SGRP
 */
export function useSGRPAuth() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated && location !== "/login") {
      setLocation("/login");
    }
  }, [loading, isAuthenticated, location, setLocation]);

  /**
   * Verificar se usuário tem uma permissão específica
   */
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    const permissions: Record<UserRole, string[]> = {
      superadmin: [
        "manage_users", "manage_companies", "manage_contacts", "manage_leads",
        "manage_opportunities", "manage_tasks", "manage_proposals",
        "view_dashboard", "view_analytics", "send_emails", "manage_pipeline_stages",
      ],
      admin: [
        "manage_users",
        "manage_companies",
        "manage_contacts",
        "manage_leads",
        "manage_opportunities",
        "manage_tasks",
        "manage_proposals",
        "view_dashboard",
        "view_analytics",
        "send_emails",
        "manage_pipeline_stages",
      ],
      gerente: [
        "manage_companies",
        "manage_contacts",
        "manage_leads",
        "manage_opportunities",
        "manage_tasks",
        "manage_proposals",
        "view_dashboard",
        "view_analytics",
        "send_emails",
      ],
      vendedor: [
        "manage_contacts",
        "manage_leads",
        "manage_opportunities",
        "manage_tasks",
        "manage_proposals",
        "view_dashboard",
        "send_emails",
      ],
    };

    return permissions[user.role]?.includes(permission) ?? false;
  };

  /**
   * Verificar se usuário é admin
   */
  const isAdmin = (): boolean => {
    return user?.role === "admin" || user?.role === "superadmin";
  };

  const isSuperAdmin = (): boolean => {
    return user?.role === "superadmin";
  };

  /**
   * Verificar se usuário é gerente ou admin
   */
  const isManagerOrAdmin = (): boolean => {
    return user?.role === "admin" || user?.role === "gerente";
  };

  /**
   * Verificar se usuário é vendedor
   */
  const isSalesperson = (): boolean => {
    return user?.role === "vendedor";
  };

  return {
    user: user as SGRPUser | null,
    loading,
    error,
    isAuthenticated,
    logout,
    hasPermission,
    isAdmin,
    isSuperAdmin,
    isManagerOrAdmin,
    isSalesperson,
  };
}
