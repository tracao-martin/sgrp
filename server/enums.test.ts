import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    email: "test@example.com",
    passwordHash: "$2a$12$fakehash",
    name: "Test User",
    role: "admin",
    departamento: null,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ============================================================================
// LEAD STATUS ENUM
// ============================================================================

const VALID_LEAD_STATUSES = [
  "novo",
  "contatado",
  "qualificado",
  "desqualificado",
  "convertido",
  "aposentado",
] as const;

describe("lead_status enum", () => {
  it("has exactly 6 valid values", () => {
    expect(VALID_LEAD_STATUSES).toHaveLength(6);
  });

  it("uses 'contatado' not the deprecated 'em_contato'", () => {
    expect(VALID_LEAD_STATUSES).toContain("contatado");
    expect(VALID_LEAD_STATUSES).not.toContain("em_contato");
  });

  it("uses 'desqualificado' not the deprecated 'perdido'", () => {
    expect(VALID_LEAD_STATUSES).toContain("desqualificado");
    expect(VALID_LEAD_STATUSES).not.toContain("perdido");
  });

  it("includes 'aposentado'", () => {
    expect(VALID_LEAD_STATUSES).toContain("aposentado");
  });

  it("rejects deprecated value 'em_contato' via Zod validation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.leads.update({ id: 1, status: "em_contato" as any })
    ).rejects.toThrow();
  });

  it("rejects deprecated value 'perdido' via Zod validation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.leads.update({ id: 1, status: "perdido" as any })
    ).rejects.toThrow();
  });
});

// ============================================================================
// OPPORTUNITY STATUS ENUM
// ============================================================================

const VALID_OPPORTUNITY_STATUSES = [
  "aberta",
  "ganha",
  "perdida",
  "cancelada",
] as const;

describe("opportunity_status enum", () => {
  it("has exactly 4 valid values", () => {
    expect(VALID_OPPORTUNITY_STATUSES).toHaveLength(4);
  });

  it("uses 'cancelada' not the deprecated 'suspensa'", () => {
    expect(VALID_OPPORTUNITY_STATUSES).toContain("cancelada");
    expect(VALID_OPPORTUNITY_STATUSES).not.toContain("suspensa");
  });

  it("rejects deprecated value 'suspensa' via Zod validation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.opportunities.update({ id: 1, status: "suspensa" as any })
    ).rejects.toThrow();
  });
});

// ============================================================================
// TASK STATUS / PRIORITY ENUMS
// ============================================================================

const VALID_TASK_STATUSES = [
  "pendente",
  "em_progresso",
  "concluida",
  "cancelada",
] as const;

const VALID_TASK_PRIORITIES = ["baixa", "media", "alta", "critica"] as const;

describe("task_status enum", () => {
  it("uses 'em_progresso' not the deprecated 'em_andamento'", () => {
    expect(VALID_TASK_STATUSES).toContain("em_progresso");
    expect(VALID_TASK_STATUSES).not.toContain("em_andamento");
  });

  it("rejects deprecated value 'em_andamento' via Zod validation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.tasks.update({ id: 1, status: "em_andamento" as any })
    ).rejects.toThrow();
  });
});

describe("task_prioridade enum", () => {
  it("uses 'critica' not the deprecated 'urgente'", () => {
    expect(VALID_TASK_PRIORITIES).toContain("critica");
    expect(VALID_TASK_PRIORITIES).not.toContain("urgente");
  });

  it("rejects deprecated value 'urgente' via Zod validation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.tasks.update({ id: 1, prioridade: "urgente" as any })
    ).rejects.toThrow();
  });
});
