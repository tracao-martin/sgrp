CREATE TYPE "public"."product_recorrencia" AS ENUM('mensal', 'anual', 'unico', 'sob_demanda');

CREATE TABLE "products" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" integer NOT NULL,
  "nome" varchar(255) NOT NULL,
  "descricao" text,
  "categoria" varchar(100),
  "preco_base" numeric(15, 2) NOT NULL DEFAULT '0',
  "recorrencia" "product_recorrencia" NOT NULL DEFAULT 'mensal',
  "unidade" varchar(50),
  "ativo" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
