-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" integer NOT NULL,
  "nome" varchar(255) NOT NULL,
  "descricao" text,
  "categoria" varchar(100),
  "preco_base" numeric(15, 2) NOT NULL DEFAULT '0',
  "recorrencia" varchar(20) NOT NULL DEFAULT 'mensal',
  "unidade" varchar(50),
  "ativo" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Create disqualify_reasons table
CREATE TABLE IF NOT EXISTS "disqualify_reasons" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" integer NOT NULL,
  "nome" varchar(255) NOT NULL,
  "tipo" varchar(50) NOT NULL DEFAULT 'desqualificacao',
  "ativo" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now()
);
