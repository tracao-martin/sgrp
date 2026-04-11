CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int,
	`contact_id` int,
	`opportunity_id` int,
	`tipo` enum('email','chamada','reuniao','nota','proposta','outro') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` longtext,
	`usuario_id` int NOT NULL,
	`data_atividade` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`opportunity_id` int NOT NULL,
	`tipo` enum('resumo','proximos_passos','probabilidade_fechamento') NOT NULL,
	`conteudo` longtext NOT NULL,
	`gerado_em` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`email` varchar(320),
	`telefone` varchar(20),
	`website` varchar(255),
	`endereco` text,
	`cidade` varchar(100),
	`estado` varchar(2),
	`pais` varchar(100),
	`segmento` varchar(100),
	`tamanho` enum('micro','pequena','media','grande','multinacional'),
	`receita_anual` decimal(15,2),
	`responsavel_id` int,
	`status` enum('ativa','inativa','prospect') NOT NULL DEFAULT 'prospect',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_cnpj_unique` UNIQUE(`cnpj`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320),
	`telefone` varchar(20),
	`cargo` varchar(100),
	`departamento` varchar(100),
	`linkedin` varchar(255),
	`principal` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contacts_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuario_id` int NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`destinatario` varchar(320) NOT NULL,
	`assunto` varchar(255) NOT NULL,
	`corpo` longtext,
	`relacionado_a` varchar(100),
	`relacionado_id` int,
	`enviado` boolean DEFAULT false,
	`erro` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int,
	`contact_id` int,
	`titulo` varchar(255) NOT NULL,
	`descricao` longtext,
	`origem` varchar(100),
	`qualificacao` enum('frio','morno','quente','qualificado') DEFAULT 'frio',
	`valor_estimado` decimal(15,2),
	`responsavel_id` int,
	`status` enum('novo','em_contato','qualificado','convertido','perdido') DEFAULT 'novo',
	`data_conversao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuario_id` int NOT NULL,
	`tipo` enum('task_vencida','stage_mudou','nova_atribuicao','proposta_aceita','lead_qualificado') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` longtext,
	`link` varchar(255),
	`lida` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`contact_id` int,
	`lead_id` int,
	`titulo` varchar(255) NOT NULL,
	`descricao` longtext,
	`valor` decimal(15,2) NOT NULL,
	`moeda` varchar(3) DEFAULT 'BRL',
	`stage_id` int NOT NULL,
	`responsavel_id` int NOT NULL,
	`data_fechamento_prevista` timestamp,
	`probabilidade` int DEFAULT 0,
	`motivo_ganho` varchar(255),
	`motivo_perda` varchar(255),
	`status` enum('aberta','ganha','perdida','cancelada') DEFAULT 'aberta',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipeline_stages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`ordem` int NOT NULL,
	`cor` varchar(7) DEFAULT '#3B82F6',
	`probabilidade_fechamento` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pipeline_stages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposal_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposal_id` int NOT NULL,
	`descricao` varchar(255) NOT NULL,
	`quantidade` decimal(10,2) NOT NULL,
	`valor_unitario` decimal(15,2) NOT NULL,
	`subtotal` decimal(15,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `proposal_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`opportunity_id` int NOT NULL,
	`numero` varchar(50) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` longtext,
	`valor` decimal(15,2) NOT NULL,
	`moeda` varchar(3) DEFAULT 'BRL',
	`condicoes_pagamento` text,
	`validade` timestamp,
	`status` enum('rascunho','enviada','aceita','rejeitada','expirada') DEFAULT 'rascunho',
	`versao` int DEFAULT 1,
	`criado_por` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`),
	CONSTRAINT `proposals_numero_unique` UNIQUE(`numero`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` longtext,
	`opportunity_id` int,
	`contact_id` int,
	`company_id` int,
	`responsavel_id` int NOT NULL,
	`data_vencimento` timestamp NOT NULL,
	`prioridade` enum('baixa','media','alta','critica') DEFAULT 'media',
	`status` enum('pendente','em_progresso','concluida','cancelada') DEFAULT 'pendente',
	`notificacao_enviada` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','gerente','vendedor') NOT NULL DEFAULT 'vendedor';--> statement-breakpoint
ALTER TABLE `users` ADD `departamento` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `ativo` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);