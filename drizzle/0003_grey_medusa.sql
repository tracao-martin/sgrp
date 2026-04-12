CREATE TYPE "public"."cadencia_step_tipo" AS ENUM('email', 'ligacao', 'whatsapp', 'tarefa', 'linkedin');--> statement-breakpoint
CREATE TABLE "disqualify_reasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"nome" varchar(255) NOT NULL,
	"tipo" varchar(50) DEFAULT 'desqualificacao' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_cadences" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"nome" varchar(255) NOT NULL,
	"descricao" text,
	"gatilho" varchar(255),
	"ativa" boolean DEFAULT true NOT NULL,
	"steps" text,
	"total_contatos" integer DEFAULT 0,
	"taxa_resposta" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'novo'::text;--> statement-breakpoint
DROP TYPE "public"."lead_status";--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('novo', 'contatado', 'qualificado', 'desqualificado', 'convertido', 'aposentado');--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'novo'::"public"."lead_status";--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE "public"."lead_status" USING "status"::"public"."lead_status";--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "motivo_desqualificacao" varchar(255);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "cadencia_id" integer;