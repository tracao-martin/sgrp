-- Rename steps to stages in lead_cadences and clean up unused columns
ALTER TABLE "lead_cadences" ADD COLUMN IF NOT EXISTS "stages" text;
ALTER TABLE "lead_cadences" DROP COLUMN IF EXISTS "steps";
ALTER TABLE "lead_cadences" DROP COLUMN IF EXISTS "gatilho";
ALTER TABLE "lead_cadences" DROP COLUMN IF EXISTS "total_contatos";
ALTER TABLE "lead_cadences" DROP COLUMN IF EXISTS "taxa_resposta";

-- Add cadence stage tracking to leads
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "cadence_stage_id" varchar(255);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "cadence_stage_entered_at" timestamp;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "cadence_entered_at" timestamp;
