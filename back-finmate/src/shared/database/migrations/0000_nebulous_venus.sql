CREATE TABLE `categories` (
	`id` char(36) NOT NULL COMMENT 'UUID unico de la categoria',
	`user_id` char(36) COMMENT 'NULL = categoria global del sistema, UUID = categoria personalizada del usuario',
	`type` enum('income','expense') NOT NULL COMMENT 'Define si la categoria es para ingresos o gastos',
	`name` varchar(100) NOT NULL COMMENT 'Nombre de la categoria',
	`icon` varchar(50) COMMENT 'Nombre/icono visual opcional',
	`color` varchar(20) COMMENT 'Color opcional para UI',
	`sort_order` decimal NOT NULL DEFAULT '0' COMMENT 'Orden visual en listados',
	`is_active` boolean NOT NULL DEFAULT true COMMENT 'Permite desactivar categorias sin borrarlas',
	`is_system` boolean NOT NULL DEFAULT false COMMENT 'Indica si pertenece al sistema',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creacion',
	`updated_at` datetime(3) NOT NULL COMMENT 'Ultima actualizacion',
	`deleted_at` datetime(3) COMMENT 'Soft delete',
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Categorias de movimientos financieros';
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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Metas financieras de pareja';
--> statement-breakpoint
CREATE TABLE `couple_invitations` (
	`id` char(36) NOT NULL COMMENT 'UUID de la invitacion',
	`couple_id` char(36) NOT NULL COMMENT 'Grupo al que invita',
	`invited_email` varchar(190) NOT NULL COMMENT 'Email del usuario invitado',
	`status` enum('pending','accepted','declined','expired') NOT NULL DEFAULT 'pending' COMMENT 'Estado de la invitacion',
	`expires_at` datetime(3) NOT NULL COMMENT 'Fecha de expiracion',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creacion',
	`updated_at` datetime(3) NOT NULL COMMENT 'Ultima actualizacion',
	CONSTRAINT `couple_invitations_id` PRIMARY KEY(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Invitaciones a grupos financieros compartidos';
--> statement-breakpoint
CREATE TABLE `couple_members` (
	`id` char(36) NOT NULL COMMENT 'UUID del registro relacion usuario-pareja',
	`couple_id` char(36) NOT NULL COMMENT 'Pareja/grupo al que pertenece',
	`user_id` char(36) NOT NULL COMMENT 'Usuario integrante',
	`role` enum('owner','member') NOT NULL DEFAULT 'member' COMMENT 'Permisos dentro del grupo',
	`joined_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de ingreso al grupo',
	CONSTRAINT `couple_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `couple_members_couple_id_user_id_key` UNIQUE(`couple_id`,`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Relacion usuario-pareja';
--> statement-breakpoint
CREATE TABLE `couples` (
	`id` char(36) NOT NULL COMMENT 'UUID unico de la pareja/grupo financiero',
	`created_by` char(36) NOT NULL COMMENT 'Usuario que creo la pareja',
	`name` varchar(120) COMMENT 'Nombre opcional del espacio compartido',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active' COMMENT 'Estado del grupo',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creacion',
	`updated_at` datetime(3) NOT NULL COMMENT 'Ultima actualizacion',
	CONSTRAINT `couples_id` PRIMARY KEY(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Parejas/grupos financieros compartidos';
--> statement-breakpoint
CREATE TABLE `debt_payments` (
	`id` char(36) NOT NULL COMMENT 'UUID del pago realizado',
	`debt_id` char(36) NOT NULL COMMENT 'Deuda asociada',
	`user_id` char(36) NOT NULL COMMENT 'Usuario que realizo el pago',
	`amount` decimal(19,4) NOT NULL COMMENT 'Monto pagado',
	`payment_date` datetime(3) NOT NULL COMMENT 'Fecha del pago',
	`notes` varchar(255) COMMENT 'Observaciones opcionales',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creacion',
	CONSTRAINT `debt_payments_id` PRIMARY KEY(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Pagos realizados a deudas';
--> statement-breakpoint
CREATE TABLE `debts` (
	`id` char(36) NOT NULL COMMENT 'UUID de la deuda',
	`user_id` char(36) NOT NULL COMMENT 'Usuario propietario de la deuda',
	`couple_id` char(36) COMMENT 'Relacion opcional con deuda compartida',
	`title` varchar(150) NOT NULL COMMENT 'Nombre corto de la deuda',
	`description` varchar(255) COMMENT 'Informacion adicional',
	`initial_amount` decimal(19,4) NOT NULL COMMENT 'Valor original de la deuda',
	`current_amount` decimal(19,4) NOT NULL COMMENT 'Saldo pendiente actual',
	`interest_rate` decimal(10,4) NOT NULL DEFAULT '0' COMMENT 'Tasa de interes',
	`minimum_payment` decimal(19,4) NOT NULL DEFAULT '0' COMMENT 'Pago minimo esperado',
	`due_day` tinyint COMMENT 'Dia del mes limite de pago',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium' COMMENT 'Prioridad para recomendaciones',
	`status` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending' COMMENT 'Estado actual de la deuda',
	`start_date` datetime(3) COMMENT 'Fecha de inicio',
	`end_date` datetime(3) COMMENT 'Fecha estimada de finalizacion',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creacion',
	`updated_at` datetime(3) NOT NULL COMMENT 'Ultima actualizacion',
	`deleted_at` datetime(3) COMMENT 'Soft delete',
	CONSTRAINT `debts_id` PRIMARY KEY(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Deudas registradas por el usuario';
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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Aportaciones a metas de pareja';
--> statement-breakpoint
CREATE TABLE `movements` (
	`id` char(36) NOT NULL COMMENT 'UUID del movimiento financiero',
	`user_id` char(36) NOT NULL COMMENT 'Usuario propietario del movimiento',
	`couple_id` char(36) COMMENT 'Relacion opcional con finanzas compartidas',
	`category_id` char(36) NOT NULL COMMENT 'Categoria del movimiento',
	`type` enum('income','expense') NOT NULL COMMENT 'Tipo de movimiento',
	`amount` decimal(19,4) NOT NULL COMMENT 'Valor monetario preciso',
	`description` varchar(255) COMMENT 'Descripcion opcional',
	`movement_date` datetime(3) NOT NULL COMMENT 'Fecha efectiva del movimiento',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creacion',
	`updated_at` datetime(3) NOT NULL COMMENT 'Ultima actualizacion',
	`deleted_at` datetime(3) COMMENT 'Soft delete',
	CONSTRAINT `movements_id` PRIMARY KEY(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Movimientos financieros (ingresos/gastos)';
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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Tokens de recuperacion de contrasena';
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` char(36) NOT NULL COMMENT 'UUID unico del refresh token',
	`user_id` char(36) NOT NULL COMMENT 'Usuario propietario del refresh token',
	`expires_at` datetime(3) NOT NULL COMMENT 'Fecha de expiracion del refresh token',
	`revoked` boolean NOT NULL DEFAULT false COMMENT 'Indica si el refresh token fue invalidado',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creacion',
	`updated_at` datetime(3) NOT NULL COMMENT 'Ultima actualizacion',
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Refresh tokens JWT para rotacion de sesiones';
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL COMMENT 'UUID unico del usuario',
	`name` varchar(120) NOT NULL COMMENT 'Nombre visible del usuario',
	`email` varchar(190) NOT NULL COMMENT 'Correo unico para autenticacion',
	`password_hash` varchar(255) NOT NULL COMMENT 'Contrasena hasheada con bcrypt',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active' COMMENT 'Estado logico de la cuenta',
	`email_verified_at` datetime(3) COMMENT 'Fecha de verificacion de correo',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creacion',
	`updated_at` datetime(3) NOT NULL COMMENT 'Ultima actualizacion',
	`deleted_at` datetime(3) COMMENT 'Soft delete',
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_email_key` UNIQUE(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Tabla de usuarios del sistema';
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