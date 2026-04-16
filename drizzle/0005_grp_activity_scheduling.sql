-- GRP P0: Activity scheduling fields
-- Adds status (pendente/realizada) and data_agendada to activities
-- Enables: deal health tracking, em_risco detection, stage advancement rules

CREATE TYPE "public"."activity_status" AS ENUM('pendente', 'realizada');--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "status" "activity_status" DEFAULT 'realizada' NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "data_agendada" timestamp;
