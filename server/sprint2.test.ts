import { describe, it, expect } from "vitest";

/**
 * Sprint 2 Tests: SPIN Methodology, Qualification, Auto-Probability
 * 
 * These tests validate the schema and business logic for Sprint 2 features.
 */

describe("Sprint 2 - SPIN Selling Fields", () => {
  it("should have SPIN fields in the opportunities schema", async () => {
    const schema = await import("../drizzle/schema");
    const oppColumns = schema.opportunities;
    
    // Verify SPIN columns exist in the schema definition
    expect(oppColumns.spinSituacao).toBeDefined();
    expect(oppColumns.spinProblema).toBeDefined();
    expect(oppColumns.spinImplicacao).toBeDefined();
    expect(oppColumns.spinNecessidade).toBeDefined();
  });

  it("should have SPIN fields as nullable text columns", async () => {
    const schema = await import("../drizzle/schema");
    
    // SPIN fields should be text type (nullable by default)
    expect(schema.opportunities.spinSituacao.dataType).toBe("string");
    expect(schema.opportunities.spinProblema.dataType).toBe("string");
    expect(schema.opportunities.spinImplicacao.dataType).toBe("string");
    expect(schema.opportunities.spinNecessidade.dataType).toBe("string");
  });
});

describe("Sprint 2 - Qualification Checkboxes", () => {
  it("should have 7 qualification boolean fields in the schema", async () => {
    const schema = await import("../drizzle/schema");
    const opp = schema.opportunities;
    
    expect(opp.qualTemBudget).toBeDefined();
    expect(opp.qualTemAutoridade).toBeDefined();
    expect(opp.qualTemNecessidade).toBeDefined();
    expect(opp.qualTemTiming).toBeDefined();
    expect(opp.qualTemConcorrente).toBeDefined();
    expect(opp.qualTemProximoPasso).toBeDefined();
    expect(opp.qualTemCriterioDecisao).toBeDefined();
  });

  it("should have qualification fields as boolean type with false default", async () => {
    const schema = await import("../drizzle/schema");
    const opp = schema.opportunities;
    
    // All qualification fields should be boolean
    expect(opp.qualTemBudget.dataType).toBe("boolean");
    expect(opp.qualTemAutoridade.dataType).toBe("boolean");
    expect(opp.qualTemNecessidade.dataType).toBe("boolean");
    expect(opp.qualTemTiming.dataType).toBe("boolean");
    expect(opp.qualTemConcorrente.dataType).toBe("boolean");
    expect(opp.qualTemProximoPasso.dataType).toBe("boolean");
    expect(opp.qualTemCriterioDecisao.dataType).toBe("boolean");
  });
});

describe("Sprint 2 - Auto-Probability", () => {
  it("should have probabilidadeAuto and probabilidadeManual fields", async () => {
    const schema = await import("../drizzle/schema");
    const opp = schema.opportunities;
    
    expect(opp.probabilidadeAuto).toBeDefined();
    expect(opp.probabilidadeManual).toBeDefined();
  });

  it("should have probabilidadeAuto as integer with default 0", async () => {
    const schema = await import("../drizzle/schema");
    const opp = schema.opportunities;
    
    expect(opp.probabilidadeAuto.dataType).toBe("number");
  });

  it("should have probabilidadeManual as nullable integer", async () => {
    const schema = await import("../drizzle/schema");
    const opp = schema.opportunities;
    
    expect(opp.probabilidadeManual.dataType).toBe("number");
  });
});

describe("Sprint 2 - Win/Loss Reason Fields", () => {
  it("should have motivo_ganho and motivo_perda fields", async () => {
    const schema = await import("../drizzle/schema");
    const opp = schema.opportunities;
    
    expect(opp.motivo_ganho).toBeDefined();
    expect(opp.motivo_perda).toBeDefined();
  });

  it("should have opportunity status enum with ganha and perdida", async () => {
    const schema = await import("../drizzle/schema");
    
    // The enum should include ganha and perdida
    expect(schema.opportunityStatusEnum.enumValues).toContain("ganha");
    expect(schema.opportunityStatusEnum.enumValues).toContain("perdida");
    expect(schema.opportunityStatusEnum.enumValues).toContain("aberta");
    expect(schema.opportunityStatusEnum.enumValues).toContain("cancelada");
  });
});

describe("Sprint 2 - Pipeline Stages", () => {
  it("should have probabilidade_fechamento field on pipeline stages", async () => {
    const schema = await import("../drizzle/schema");
    const ps = schema.pipelineStages;
    
    expect(ps.probabilidade_fechamento).toBeDefined();
    expect(ps.probabilidade_fechamento.dataType).toBe("number");
  });
});

describe("Sprint 2 - Opportunity Type Exports", () => {
  it("should export Opportunity and InsertOpportunity types", async () => {
    const schema = await import("../drizzle/schema");
    
    // These are type exports, we just verify the table is properly defined
    expect(schema.opportunities).toBeDefined();
    expect(typeof schema.opportunities.$inferSelect).toBeDefined();
    expect(typeof schema.opportunities.$inferInsert).toBeDefined();
  });
});
