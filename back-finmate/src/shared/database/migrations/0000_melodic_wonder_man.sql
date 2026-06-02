CREATE TABLE `categories` (
	`id` char(36) NOT NULL,
	`user_id` char(36),
	`type` enum('income','expense') NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(50),
	`color` varchar(20),
	`is_active` boolean NOT NULL DEFAULT true,
	`is_system` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL,
	`deleted_at` datetime(3),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `couple_goals` (
	`id` char(36) NOT NULL,
	`couple_id` char(36) NOT NULL,
	`title` varchar(150) NOT NULL,
	`target_amount` decimal(19,4) NOT NULL,
	`current_amount` decimal(19,4) NOT NULL DEFAULT '0',
	`deadline` datetime(3),
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`created_by` char(36) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL,
	`deleted_at` datetime(3),
	CONSTRAINT `couple_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `couple_invitations` (
	`id` char(36) NOT NULL,
	`couple_id` char(36) NOT NULL,
	`invited_email` varchar(190) NOT NULL,
	`status` enum('pending','accepted','declined','expired') NOT NULL DEFAULT 'pending',
	`expires_at` datetime(3) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `couple_invitations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `couple_members` (
	`id` char(36) NOT NULL,
	`couple_id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`role` enum('owner','member') NOT NULL DEFAULT 'member',
	`joined_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `couple_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `couple_members_couple_id_user_id_key` UNIQUE(`couple_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `couples` (
	`id` char(36) NOT NULL,
	`created_by` char(36) NOT NULL,
	`name` varchar(120),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `couples_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_payments` (
	`id` char(36) NOT NULL,
	`debt_id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`amount` decimal(19,4) NOT NULL,
	`payment_date` datetime(3) NOT NULL,
	`notes` varchar(255),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `debt_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debts` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`couple_id` char(36),
	`title` varchar(150) NOT NULL,
	`description` varchar(255),
	`initial_amount` decimal(19,4) NOT NULL,
	`current_amount` decimal(19,4) NOT NULL,
	`interest_rate` decimal(10,4) NOT NULL DEFAULT '0',
	`minimum_payment` decimal(19,4) NOT NULL DEFAULT '0',
	`due_day` tinyint,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending',
	`start_date` datetime(3),
	`end_date` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL,
	`deleted_at` datetime(3),
	CONSTRAINT `debts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_contributions` (
	`id` char(36) NOT NULL,
	`goal_id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`amount` decimal(19,4) NOT NULL,
	`notes` varchar(255),
	`date` datetime(3) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `goal_contributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `movements` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`couple_id` char(36),
	`category_id` char(36) NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`amount` decimal(19,4) NOT NULL,
	`description` varchar(255),
	`movement_date` datetime(3) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL,
	`deleted_at` datetime(3),
	CONSTRAINT `movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`used` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_token_key` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`revoked` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(190) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`email_verified_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL,
	`deleted_at` datetime(3),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_email_key` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `idx_categories_user_id` ON `categories` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_categories_type` ON `categories` (`type`);--> statement-breakpoint
CREATE INDEX `idx_couple_goals_couple_id` ON `couple_goals` (`couple_id`);--> statement-breakpoint
CREATE INDEX `idx_couple_goals_status` ON `couple_goals` (`status`);--> statement-breakpoint
CREATE INDEX `idx_couple_goals_created_by` ON `couple_goals` (`created_by`);--> statement-breakpoint
CREATE INDEX `idx_invitations_couple_id` ON `couple_invitations` (`couple_id`);--> statement-breakpoint
CREATE INDEX `idx_couple_members_user_id` ON `couple_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_couples_created_by` ON `couples` (`created_by`);--> statement-breakpoint
CREATE INDEX `idx_debt_payments_debt_id` ON `debt_payments` (`debt_id`);--> statement-breakpoint
CREATE INDEX `idx_debt_payments_user_id` ON `debt_payments` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_debts_user_id` ON `debts` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_debts_couple_id` ON `debts` (`couple_id`);--> statement-breakpoint
CREATE INDEX `idx_debts_status` ON `debts` (`status`);--> statement-breakpoint
CREATE INDEX `idx_goal_contributions_goal_id` ON `goal_contributions` (`goal_id`);--> statement-breakpoint
CREATE INDEX `idx_goal_contributions_user_id` ON `goal_contributions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_movements_user_id` ON `movements` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_movements_couple_id` ON `movements` (`couple_id`);--> statement-breakpoint
CREATE INDEX `idx_movements_category_id` ON `movements` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_movements_type_date` ON `movements` (`type`,`movement_date`);--> statement-breakpoint
CREATE INDEX `idx_password_reset_user_id` ON `password_reset_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_refresh_tokens_user_id` ON `refresh_tokens` (`user_id`);