CREATE TYPE "public"."activity_tipo" AS ENUM('email', 'chamada', 'reuniao', 'nota', 'proposta', 'outro');--> statement-breakpoint
CREATE TYPE "public"."ai_insight_tipo" AS ENUM('resumo', 'recomendacao', 'risco', 'oportunidade');--> statement-breakpoint
CREATE TYPE "public"."company_status" AS ENUM('ativa', 'inativa', 'prospect');--> statement-breakpoint
CREATE TYPE "public"."company_tamanho" AS ENUM('micro', 'pequena', 'media', 'grande', 'multinacional');--> statement-breakpoint
CREATE TYPE "public"."lead_qualificacao" AS ENUM('frio', 'morno', 'quente', 'qualificado');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('novo', 'em_contato', 'qualificado', 'convertido', 'perdido');--> statement-breakpoint
CREATE TYPE "public"."notification_tipo" AS ENUM('task_vencida', 'stage_mudou', 'nova_atribuicao', 'proposta_aceita', 'lead_qualificado');--> statement-breakpoint
CREATE TYPE "public"."opportunity_status" AS ENUM('aberta', 'ganha', 'perdida', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."org_plano" AS ENUM('trial', 'basico', 'profissional', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('rascunho', 'enviada', 'aceita', 'rejeitada', 'expirada');--> statement-breakpoint
CREATE TYPE "public"."task_prioridade" AS ENUM('baixa', 'media', 'alta', 'critica');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pendente', 'em_progresso', 'concluida', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'gerente', 'vendedor');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"company_id" integer,
	"contact_id" integer,
	"opportunity_id" integer,
	"tipo" "activity_tipo" NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"descricao" text,
	"usuario_id" integer NOT NULL,
	"data_atividade" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"tipo" "ai_insight_tipo" NOT NULL,
	"conteudo" text NOT NULL,
	"gerado_em" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"nome" varchar(255) NOT NULL,
	"cnpj" varchar(20),
	"email" varchar(320),
	"telefone" varchar(20),
	"website" varchar(255),
	"endereco" text,
	"cidade" varchar(100),
	"estado" varchar(2),
	"pais" varchar(100),
	"segmento" varchar(100),
	"tamanho" "company_tamanho",
	"receita_anual" numeric(15, 2),
	"responsavel_id" integer,
	"status" "company_status" DEFAULT 'prospect' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"nome" varchar(255) NOT NULL,
	"email" varchar(320),
	"telefone" varchar(20),
	"cargo" varchar(100),
	"departamento" varchar(100),
	"linkedin" varchar(255),
	"principal" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"tipo" varchar(100) NOT NULL,
	"destinatario" varchar(320) NOT NULL,
	"assunto" varchar(255) NOT NULL,
	"corpo" text,
	"relacionado_a" varchar(100),
	"relacionado_id" integer,
	"enviado" boolean DEFAULT false,
	"erro" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"company_id" integer,
	"contact_id" integer,
	"titulo" varchar(255) NOT NULL,
	"descricao" text,
	"origem" varchar(100),
	"qualificacao" "lead_qualificacao" DEFAULT 'frio',
	"valor_estimado" numeric(15, 2),
	"responsavel_id" integer,
	"status" "lead_status" DEFAULT 'novo',
	"data_conversao" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"tipo" "notification_tipo" NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"mensagem" text,
	"link" varchar(255),
	"lida" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"contact_id" integer,
	"lead_id" integer,
	"titulo" varchar(255) NOT NULL,
	"descricao" text,
	"valor" numeric(15, 2) NOT NULL,
	"moeda" varchar(3) DEFAULT 'BRL',
	"stage_id" integer NOT NULL,
	"responsavel_id" integer NOT NULL,
	"data_fechamento_prevista" timestamp,
	"probabilidade" integer DEFAULT 0,
	"motivo_ganho" varchar(255),
	"motivo_perda" varchar(255),
	"status" "opportunity_status" DEFAULT 'aberta',
	"spin_situacao" text,
	"spin_problema" text,
	"spin_implicacao" text,
	"spin_necessidade" text,
	"qual_tem_budget" boolean DEFAULT false,
	"qual_tem_autoridade" boolean DEFAULT false,
	"qual_tem_necessidade" boolean DEFAULT false,
	"qual_tem_timing" boolean DEFAULT false,
	"qual_tem_concorrente" boolean DEFAULT false,
	"qual_tem_proximo_passo" boolean DEFAULT false,
	"qual_tem_criterio_decisao" boolean DEFAULT false,
	"probabilidade_auto" integer DEFAULT 0,
	"probabilidade_manual" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"cnpj" varchar(20),
	"email" varchar(320),
	"telefone" varchar(20),
	"plano" "org_plano" DEFAULT 'trial' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"max_usuarios" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pipeline_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"nome" varchar(100) NOT NULL,
	"ordem" integer NOT NULL,
	"cor" varchar(7) DEFAULT '#3B82F6',
	"probabilidade_fechamento" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"proposal_id" integer NOT NULL,
	"descricao" varchar(255) NOT NULL,
	"quantidade" numeric(10, 2) NOT NULL,
	"valor_unitario" numeric(15, 2) NOT NULL,
	"subtotal" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"opportunity_id" integer NOT NULL,
	"numero" varchar(50) NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"descricao" text,
	"valor" numeric(15, 2) NOT NULL,
	"moeda" varchar(3) DEFAULT 'BRL',
	"condicoes_pagamento" text,
	"validade" timestamp,
	"status" "proposal_status" DEFAULT 'rascunho',
	"versao" integer DEFAULT 1,
	"criado_por" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"descricao" text,
	"opportunity_id" integer,
	"contact_id" integer,
	"company_id" integer,
	"responsavel_id" integer NOT NULL,
	"data_vencimento" timestamp NOT NULL,
	"prioridade" "task_prioridade" DEFAULT 'media',
	"status" "task_status" DEFAULT 'pendente',
	"notificacao_enviada" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" text,
	"role" "user_role" DEFAULT 'vendedor' NOT NULL,
	"is_org_admin" boolean DEFAULT false NOT NULL,
	"departamento" varchar(255),
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
