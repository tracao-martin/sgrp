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

describe("CRM Router Structure", () => {
  it("should have crm router on appRouter", () => {
    expect(appRouter).toBeDefined();
    expect(appRouter._def).toBeDefined();
  });

  it("should create a caller without errors", () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller).toBeDefined();
    expect(caller.crm).toBeDefined();
  });

  it("should have companies sub-router with full CRUD", () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.crm.companies).toBeDefined();
    expect(caller.crm.companies.list).toBeDefined();
    expect(caller.crm.companies.create).toBeDefined();
    expect(caller.crm.companies.update).toBeDefined();
    expect(caller.crm.companies.getById).toBeDefined();
    expect(caller.crm.companies.delete).toBeDefined();
  });

  it("should have contacts sub-router with full CRUD", () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.crm.contacts).toBeDefined();
    expect(caller.crm.contacts.list).toBeDefined();
    expect(caller.crm.contacts.listByCompany).toBeDefined();
    expect(caller.crm.contacts.create).toBeDefined();
    expect(caller.crm.contacts.update).toBeDefined();
    expect(caller.crm.contacts.getById).toBeDefined();
    expect(caller.crm.contacts.delete).toBeDefined();
  });

  it("should have leads sub-router with full CRUD", () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.crm.leads).toBeDefined();
    expect(caller.crm.leads.list).toBeDefined();
    expect(caller.crm.leads.create).toBeDefined();
    expect(caller.crm.leads.getById).toBeDefined();
    expect(caller.crm.leads.update).toBeDefined();
    expect(caller.crm.leads.delete).toBeDefined();
    expect(caller.crm.leads.updateQualification).toBeDefined();
    expect(caller.crm.leads.convertToOpportunity).toBeDefined();
  });

  it("should have activities sub-router with list and delete", () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.crm.activities).toBeDefined();
    expect(caller.crm.activities.list).toBeDefined();
    expect(caller.crm.activities.getByOpportunity).toBeDefined();
    expect(caller.crm.activities.getByContact).toBeDefined();
    expect(caller.crm.activities.create).toBeDefined();
    expect(caller.crm.activities.delete).toBeDefined();
  });

  it("should have pipelineStages sub-router", () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.crm.pipelineStages).toBeDefined();
    expect(caller.crm.pipelineStages.list).toBeDefined();
  });

  it("should have opportunities sub-router with full CRUD", () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.crm.opportunities).toBeDefined();
    expect(caller.crm.opportunities.list).toBeDefined();
    expect(caller.crm.opportunities.create).toBeDefined();
    expect(caller.crm.opportunities.update).toBeDefined();
    expect(caller.crm.opportunities.updateStage).toBeDefined();
    expect(caller.crm.opportunities.delete).toBeDefined();
  });

  it("should have tasks sub-router with full CRUD", () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.crm.tasks).toBeDefined();
    expect(caller.crm.tasks.list).toBeDefined();
    expect(caller.crm.tasks.create).toBeDefined();
    expect(caller.crm.tasks.update).toBeDefined();
    expect(caller.crm.tasks.delete).toBeDefined();
  });
});

describe("CRM Input Validation", () => {
  it("should reject company creation without required fields", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.companies.create({} as any)
    ).rejects.toThrow();
  });

  it("should reject lead creation without required fields", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.leads.create({} as any)
    ).rejects.toThrow();
  });

  it("should reject task creation without required fields", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.tasks.create({} as any)
    ).rejects.toThrow();
  });

  it("should reject opportunity creation without required fields", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.opportunities.create({} as any)
    ).rejects.toThrow();
  });

  it("should reject contact creation without required fields", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.contacts.create({} as any)
    ).rejects.toThrow();
  });
});
