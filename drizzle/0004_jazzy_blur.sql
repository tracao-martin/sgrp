CREATE TYPE "public"."account_type" AS ENUM('cliente_ativo', 'cliente_inativo', 'prospect');--> statement-breakpoint
CREATE TYPE "public"."contact_papel" AS ENUM('decisor', 'influenciador', 'champion', 'usuario', 'tecnico', 'outro');--> statement-breakpoint
CREATE TABLE "account_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"contact_id" integer NOT NULL,
	"papel" "contact_papel",
	"notas" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "icp_id" integer;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "lead_source" varchar(100);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "site" varchar(500);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "linkedin" varchar(500);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "primary_contact_id" integer;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "primary_contact_name" varchar(255);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "account_type" "account_type" DEFAULT 'prospect';--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "papel" "contact_papel";--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "notas" text;