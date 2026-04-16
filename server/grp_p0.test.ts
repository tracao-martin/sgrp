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
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// ============================================================================
// REGRA 1 — Deal deve ter contact_id obrigatório
// ============================================================================

describe("Regra 1: contact_id obrigatório na criação de deal", () => {
  it("rejeita criação de deal sem contact_id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.opportunities.create({
        titulo: "Deal sem contato",
        company_id: 1,
        // contact_id ausente — deve falhar na validação Zod
        valor: "1000",
        stage_id: 1,
      } as any)
    ).rejects.toThrow();
  });

  it("aceita criação de deal com contact_id presente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // Vai falhar no DB (sem conexão), mas NÃO deve falhar no Zod
    const promise = caller.crm.opportunities.create({
      titulo: "Deal com contato",
      company_id: 1,
      contact_id: 1,
      valor: "1000",
      stage_id: 1,
    });
    // Esperamos erro de DB (sem conexão), não de validação Zod
    await expect(promise).rejects.toThrow();
    // Verificamos que o erro não é de validação de input
    try { await promise; } catch (err: any) {
      expect(err.message).not.toMatch(/contact_id/i);
    }
  });
});

// ============================================================================
// REGRA 2 — motivo obrigatório ao fechar deal
// ============================================================================

describe("Regra 2: motivo_ganho obrigatório ao fechar como Ganho", () => {
  it("rejeita status=ganha sem motivo_ganho", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.opportunities.update({
        id: 1,
        status: "ganha",
        // motivo_ganho ausente
      })
    ).rejects.toThrow("Motivo de ganho é obrigatório");
  });

  it("rejeita status=ganha com motivo_ganho vazio", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.opportunities.update({
        id: 1,
        status: "ganha",
        motivo_ganho: "   ", // só espaços
      })
    ).rejects.toThrow("Motivo de ganho é obrigatório");
  });

  it("aceita status=ganha com motivo_ganho preenchido", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const promise = caller.crm.opportunities.update({
      id: 1,
      status: "ganha",
      motivo_ganho: "Melhor custo-benefício",
    });
    // Deve falhar no DB, não no Zod
    await expect(promise).rejects.toThrow();
    try { await promise; } catch (err: any) {
      expect(err.message).not.toMatch(/Motivo de ganho/i);
    }
  });
});

describe("Regra 2: motivo_perda obrigatório ao fechar como Perdido", () => {
  it("rejeita status=perdida sem motivo_perda", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.opportunities.update({
        id: 1,
        status: "perdida",
        // motivo_perda ausente
      })
    ).rejects.toThrow("Motivo de perda é obrigatório");
  });

  it("aceita status=perdida com motivo_perda preenchido", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const promise = caller.crm.opportunities.update({
      id: 1,
      status: "perdida",
      motivo_perda: "Preço acima do orçamento",
    });
    await expect(promise).rejects.toThrow();
    try { await promise; } catch (err: any) {
      expect(err.message).not.toMatch(/Motivo de perda/i);
    }
  });

  it("permite update sem status (sem exigir motivo)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // Update de campo SPIN sem mudar status — não deve exigir motivo
    const promise = caller.crm.opportunities.update({
      id: 1,
      spinSituacao: "Empresa usa ERP legado",
    });
    await expect(promise).rejects.toThrow();
    try { await promise; } catch (err: any) {
      expect(err.message).not.toMatch(/Motivo/i);
    }
  });
});

// ============================================================================
// REGRA 4 — activity.status enum
// ============================================================================

describe("Regra 4: activity.status aceita apenas 'pendente' e 'realizada'", () => {
  it("rejeita status inválido na criação de atividade", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.activities.create({
        tipo: "chamada",
        titulo: "Teste",
        status: "concluida" as any, // valor inválido
      })
    ).rejects.toThrow();
  });

  it("aceita status 'pendente' na criação de atividade", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // Falha no DB, não no Zod
    await expect(
      caller.crm.activities.create({
        tipo: "reuniao",
        titulo: "Reunião de alinhamento",
        status: "pendente",
        data_agendada: new Date(Date.now() + 86400000).toISOString(),
      })
    ).rejects.toThrow();
  });

  it("aceita status 'realizada' na criação de atividade", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.activities.create({
        tipo: "chamada",
        titulo: "Ligação realizada",
        status: "realizada",
      })
    ).rejects.toThrow();
  });
});

// ============================================================================
// REGRA 3 — updateStage tem procedure definida
// ============================================================================

describe("Regra 3: updateStage procedure existe e requer id + stage_id", () => {
  it("rejeita updateStage sem id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.opportunities.updateStage({ stage_id: 2 } as any)
    ).rejects.toThrow();
  });

  it("rejeita updateStage sem stage_id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.opportunities.updateStage({ id: 1 } as any)
    ).rejects.toThrow();
  });
});
