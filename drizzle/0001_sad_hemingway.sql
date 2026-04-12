CREATE TYPE "public"."icp_porte" AS ENUM('micro', 'pequena', 'media', 'grande', 'multinacional');--> statement-breakpoint
CREATE TABLE "icps" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"nome" varchar(255) NOT NULL,
	"descricao" text,
	"segmentos" text,
	"portes" text,
	"faixa_receita_min" numeric(15, 2),
	"faixa_receita_max" numeric(15, 2),
	"cargos_decisor" text,
	"localizacoes" text,
	"criterios_custom" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
