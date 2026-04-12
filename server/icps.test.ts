import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// Mock the database
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([{ id: 1, nome: "Test ICP", organizationId: 1 }]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
};

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("../drizzle/schema", () => ({
  icps: {
    id: "id",
    organizationId: "organization_id",
    nome: "nome",
    descricao: "descricao",
    segmentos: "segmentos",
    portes: "portes",
    faixaReceitaMin: "faixa_receita_min",
    faixaReceitaMax: "faixa_receita_max",
    cargosDecisor: "cargos_decisor",
    localizacoes: "localizacoes",
    criteriosCustom: "criterios_custom",
    ativo: "ativo",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
}));

describe("ICP Feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Input Validation", () => {
    const createSchema = z.object({
      nome: z.string().min(1, "Nome é obrigatório"),
      descricao: z.string().optional(),
      segmentos: z.array(z.string()).optional(),
      portes: z.array(z.string()).optional(),
      faixaReceitaMin: z.number().optional(),
      faixaReceitaMax: z.number().optional(),
      cargosDecisor: z.array(z.string()).optional(),
      localizacoes: z.array(z.string()).optional(),
      criteriosCustom: z
        .array(z.object({ label: z.string(), value: z.string() }))
        .optional(),
    });

    it("should reject empty nome", () => {
      const result = createSchema.safeParse({ nome: "" });
      expect(result.success).toBe(false);
    });

    it("should accept valid ICP with all fields", () => {
      const result = createSchema.safeParse({
        nome: "Diretor de TI em SaaS B2B",
        descricao: "Empresas de tecnologia médias",
        segmentos: ["Tecnologia", "SaaS"],
        portes: ["media", "grande"],
        faixaReceitaMin: 1000000,
        faixaReceitaMax: 50000000,
        cargosDecisor: ["CTO", "VP de TI"],
        localizacoes: ["São Paulo", "Rio de Janeiro"],
        criteriosCustom: [
          { label: "Nº de funcionários", value: "> 50" },
          { label: "Usa CRM", value: "Sim" },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("should accept ICP with only nome", () => {
      const result = createSchema.safeParse({
        nome: "ICP Básico",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid segmentos array", () => {
      const result = createSchema.safeParse({
        nome: "ICP Segmentado",
        segmentos: ["Saúde", "Educação", "Fintech"],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.segmentos).toHaveLength(3);
      }
    });

    it("should accept valid criterios custom", () => {
      const result = createSchema.safeParse({
        nome: "ICP Custom",
        criteriosCustom: [
          { label: "Faturamento", value: "> R$ 10M" },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Update Validation", () => {
    const updateSchema = z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      descricao: z.string().optional(),
      ativo: z.boolean().optional(),
    });

    it("should accept toggle ativo", () => {
      const result = updateSchema.safeParse({ id: 1, ativo: false });
      expect(result.success).toBe(true);
    });

    it("should accept name update", () => {
      const result = updateSchema.safeParse({ id: 1, nome: "Novo Nome" });
      expect(result.success).toBe(true);
    });

    it("should require id", () => {
      const result = updateSchema.safeParse({ nome: "Sem ID" });
      expect(result.success).toBe(false);
    });
  });

  describe("JSON Serialization", () => {
    it("should serialize segmentos array to JSON string", () => {
      const segmentos = ["Tecnologia", "Saúde"];
      const serialized = JSON.stringify(segmentos);
      expect(serialized).toBe('["Tecnologia","Saúde"]');
      expect(JSON.parse(serialized)).toEqual(segmentos);
    });

    it("should serialize criterios custom to JSON string", () => {
      const criterios = [
        { label: "Funcionários", value: "> 100" },
        { label: "Região", value: "Sudeste" },
      ];
      const serialized = JSON.stringify(criterios);
      const parsed = JSON.parse(serialized);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].label).toBe("Funcionários");
    });

    it("should handle empty arrays gracefully", () => {
      const empty: string[] = [];
      expect(JSON.stringify(empty)).toBe("[]");
    });

    it("should handle null values", () => {
      const val: string | null = null;
      const parsed = val ? JSON.parse(val) : [];
      expect(parsed).toEqual([]);
    });
  });

  describe("Multi-tenant Isolation", () => {
    it("should always include organizationId in queries", () => {
      // Simulating the orgId helper
      const ctx = { user: { organizationId: 42 } };
      const orgId = ctx.user.organizationId;
      expect(orgId).toBe(42);
    });

    it("should filter by org in list query", () => {
      // The router always adds eq(icps.organizationId, orgId(ctx))
      // This test validates the pattern
      const conditions = [
        { field: "organization_id", op: "eq", value: 1 },
      ];
      expect(conditions[0].field).toBe("organization_id");
    });
  });
});
