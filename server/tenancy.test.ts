import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

/**
 * Mock do dbPool — substitui a conexao real por um fake que registra cada
 * chamada de `execute` no mock. Isso permite validar o contrato de scoping
 * do middleware (runInTenant/runWithBypass) sem Postgres.
 *
 * Importante: vi.mock e hoisted; usamos vi.hoisted() para compartilhar
 * estado entre o factory e os testes.
 */
const mocks = vi.hoisted(() => {
  class DatabaseUnavailableError extends Error {
    constructor() {
      super("Database not available");
      this.name = "DatabaseUnavailableError";
    }
  }
  const mockExecute = vi.fn(async () => undefined);
  const mockTransaction = vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => {
    return cb({ execute: mockExecute });
  });
  return {
    DatabaseUnavailableError,
    mockExecute,
    mockTransaction,
    state: { dbAvailable: true },
  };
});

vi.mock("./_core/dbPool", () => ({
  DatabaseUnavailableError: mocks.DatabaseUnavailableError,
  getBaseDb: () =>
    mocks.state.dbAvailable ? { transaction: mocks.mockTransaction } : null,
  getPool: () => null,
}));

const { mockExecute, mockTransaction, DatabaseUnavailableError } = mocks;

import { runInTenant, runWithBypass } from "./_core/tenantDb";
import { appRouter } from "./routers";

function extractExecutedSql(call: unknown): string {
  // Drizzle sql`...` produz um objeto com queryChunks/sql. Reduzimos para
  // um snapshot em string para permitir assertions simples.
  const obj = call as { queryChunks?: unknown[]; sql?: string; toString: () => string };
  if (obj.queryChunks) {
    return JSON.stringify(obj.queryChunks);
  }
  return obj.sql ?? String(obj);
}

function createUser(overrides: Partial<TrpcContext["user"] & object> = {}): NonNullable<TrpcContext["user"]> {
  return {
    id: 1,
    organizationId: 10,
    email: "user@org10.com",
    passwordHash: "hash",
    name: "User",
    role: "vendedor",
    isOrgAdmin: false,
    departamento: null,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  } as NonNullable<TrpcContext["user"]>;
}

function createContext(user: NonNullable<TrpcContext["user"]> | null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

beforeEach(() => {
  mockExecute.mockClear();
  mockTransaction.mockClear();
  mocks.state.dbAvailable = true;
});

// ============================================================================
// runInTenant — unidade
// ============================================================================

describe("runInTenant", () => {
  it("abre transacao, define app.org_id e bypass=off para tenant normal", async () => {
    const cb = vi.fn(async () => "resultado");
    const result = await runInTenant(42, false, cb);

    expect(result).toBe("resultado");
    expect(mockTransaction).toHaveBeenCalledOnce();
    expect(mockExecute).toHaveBeenCalledTimes(2);

    const [firstCall, secondCall] = mockExecute.mock.calls;
    const firstSql = extractExecutedSql(firstCall[0]);
    const secondSql = extractExecutedSql(secondCall[0]);

    expect(firstSql).toContain("app.org_id");
    expect(firstSql).toContain("42");
    expect(secondSql).toContain("app.bypass_rls");
    expect(secondSql).toContain("off");

    expect(cb).toHaveBeenCalledOnce();
  });

  it("define bypass=on para superadmin", async () => {
    await runInTenant(99, true, async () => null);

    const secondSql = extractExecutedSql(mockExecute.mock.calls[1][0]);
    expect(secondSql).toContain("app.bypass_rls");
    expect(secondSql).toContain("on");
  });

  it("lanca DatabaseUnavailableError quando DB indisponivel", async () => {
    mocks.state.dbAvailable = false;
    await expect(runInTenant(1, false, async () => null)).rejects.toBeInstanceOf(
      DatabaseUnavailableError,
    );
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("propaga excecao do callback (forcando rollback da transacao)", async () => {
    await expect(
      runInTenant(1, false, async () => {
        throw new Error("regra de negocio");
      }),
    ).rejects.toThrow("regra de negocio");
    expect(mockTransaction).toHaveBeenCalledOnce();
  });
});

// ============================================================================
// runWithBypass — unidade
// ============================================================================

describe("runWithBypass", () => {
  it("define bypass=on em transacao (sem org_id)", async () => {
    await runWithBypass(async () => "ok");

    expect(mockTransaction).toHaveBeenCalledOnce();
    expect(mockExecute).toHaveBeenCalledTimes(1);
    const sql = extractExecutedSql(mockExecute.mock.calls[0][0]);
    expect(sql).toContain("app.bypass_rls");
    expect(sql).toContain("on");
  });
});

// ============================================================================
// Middleware tRPC — protectedProcedure aplica scoping por user
// ============================================================================

describe("protectedProcedure middleware (scoping por usuario)", () => {
  it("injeta app.org_id baseado em ctx.user.organizationId", async () => {
    const ctx = createContext(createUser({ organizationId: 77, role: "vendedor" }));
    const caller = appRouter.createCaller(ctx);

    // Procedure sem IO real — so queremos verificar que o middleware rodou.
    // list() dentro da transacao chama ctx.db.select — como nosso mock
    // transaction retorna um tx com `execute`, mas sem select(), cai em
    // excecao. Capturamos a excecao e validamos que set_config foi chamado
    // ANTES.
    await caller.crm.companies.list({ limit: 10 }).catch(() => undefined);

    // Pelo menos 2 execute calls (org_id + bypass_rls) antes do select falhar
    expect(mockExecute).toHaveBeenCalled();
    const sqls = mockExecute.mock.calls.map((c) => extractExecutedSql(c[0]));
    expect(sqls.some((s) => s.includes("app.org_id") && s.includes("77"))).toBe(true);
  });

  it("ativa bypass_rls=on para superadmin", async () => {
    const ctx = createContext(createUser({ organizationId: 1, role: "superadmin" }));
    const caller = appRouter.createCaller(ctx);

    await caller.crm.companies.list({ limit: 10 }).catch(() => undefined);

    const sqls = mockExecute.mock.calls.map((c) => extractExecutedSql(c[0]));
    const bypassCall = sqls.find((s) => s.includes("app.bypass_rls"));
    expect(bypassCall).toBeDefined();
    expect(bypassCall).toContain("on");
  });

  it("rejeita usuario nao autenticado (ctx.user = null)", async () => {
    const ctx = createContext(null);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.crm.companies.list({ limit: 10 })).rejects.toThrow();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("degrada gracioso quando DB indisponivel (fallback sem transacao)", async () => {
    mocks.state.dbAvailable = false;
    const ctx = createContext(createUser({ organizationId: 5, role: "vendedor" }));
    const caller = appRouter.createCaller(ctx);

    // Handler deve rodar com ctx.db = undefined — guard interno retorna []
    const result = await caller.crm.companies.list({ limit: 10 }).catch((e) => e);
    // Ou retorna [] ou joga erro de "Database not available" — ambos sao
    // comportamento correto do fallback.
    expect(mockTransaction).not.toHaveBeenCalled();
    if (Array.isArray(result)) {
      expect(result).toEqual([]);
    } else {
      expect(result).toBeInstanceOf(Error);
    }
  });
});

// ============================================================================
// Middleware tRPC — adminProcedure e superadminProcedure
// ============================================================================

describe("adminProcedure / superadminProcedure", () => {
  it("adminProcedure rejeita role vendedor", async () => {
    const ctx = createContext(createUser({ role: "vendedor" }));
    const caller = appRouter.createCaller(ctx);
    // auth.updateUserRole usa protectedProcedure + check interno; aqui
    // validamos admin.users.list que usa superadminProcedure
    await expect(caller.admin.users.list()).rejects.toThrow();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("superadminProcedure aceita role superadmin e usa bypass_rls", async () => {
    const ctx = createContext(createUser({ role: "superadmin", organizationId: 1 }));
    const caller = appRouter.createCaller(ctx);

    await caller.admin.users.list().catch(() => undefined);

    expect(mockTransaction).toHaveBeenCalled();
    const sqls = mockExecute.mock.calls.map((c) => extractExecutedSql(c[0]));
    // runWithBypass define apenas bypass_rls=on (sem org_id)
    expect(sqls.some((s) => s.includes("app.bypass_rls") && s.includes("on"))).toBe(true);
  });
});
