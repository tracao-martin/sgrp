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

describe("Expert Router Structure", () => {
  it("should have expert router on appRouter", () => {
    expect(appRouter).toBeDefined();
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.expert).toBeDefined();
  });

  it("should have chat mutation", () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.expert.chat).toBeDefined();
  });

  it("should have getInsights query", () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.expert.getInsights).toBeDefined();
  });

  it("should reject chat without message field", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.expert.chat({} as any)
    ).rejects.toThrow();
  });
});

describe("Users Router Structure", () => {
  it("should have users sub-router on crm", () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.crm.users).toBeDefined();
  });

  it("should have users.list query", () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.crm.users.list).toBeDefined();
  });
});
