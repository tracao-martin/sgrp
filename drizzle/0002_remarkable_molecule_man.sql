ALTER TABLE "activities" ADD COLUMN "lead_id" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "cadencia" varchar(100);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "fase_cadencia" varchar(100);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "telefone" varchar(30);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "email" varchar(320);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "cargo" varchar(150);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "empresa" varchar(255);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "linkedin" varchar(500);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "site" varchar(500);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "cpf_cnpj" varchar(30);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "setor" varchar(100);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "regiao" varchar(100);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "porte" varchar(50);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "icp_id" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "notas" text;