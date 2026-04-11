import { TRPCError } from "@trpc/server";
import type { User } from "../drizzle/schema";

/**
 * Permission definitions for role-based access control
 */
export type Permission =
  | "manage_users"
  | "manage_companies"
  | "manage_contacts"
  | "manage_leads"
  | "manage_opportunities"
  | "manage_tasks"
  | "manage_proposals"
  | "view_dashboard"
  | "view_analytics"
  | "send_emails"
  | "manage_pipeline_stages";

/**
 * Role-based permissions matrix
 */
const rolePermissions: Record<string, Permission[]> = {
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

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User, permission: Permission): boolean {
  const permissions = rolePermissions[user.role] || [];
  return permissions.includes(permission);
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(user: User, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(user, p));
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(user: User, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(user, p));
}

/**
 * Throw error if user doesn't have permission
 */
export function requirePermission(user: User, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Usuário não tem permissão para: ${permission}`,
    });
  }
}

/**
 * Throw error if user is not admin
 */
export function requireAdmin(user: User): void {
  if (user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas administradores podem acessar este recurso",
    });
  }
}

/**
 * Throw error if user is not admin or gerente
 */
export function requireManagerOrAdmin(user: User): void {
  if (user.role !== "admin" && user.role !== "gerente") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas gerentes e administradores podem acessar este recurso",
    });
  }
}

/**
 * Check if user can access a resource they don't own
 * Admins and gerentes can access any resource
 * Vendedores can only access their own resources
 */
export function canAccessResource(user: User, resourceOwnerId: number): boolean {
  if (user.role === "admin" || user.role === "gerente") {
    return true;
  }
  return user.id === resourceOwnerId;
}

/**
 * Throw error if user can't access resource
 */
export function requireResourceAccess(user: User, resourceOwnerId: number): void {
  if (!canAccessResource(user, resourceOwnerId)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Você não tem permissão para acessar este recurso",
    });
  }
}
