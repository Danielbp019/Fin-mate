CREATE TABLE `categories` (
	`id` char(36) NOT NULL COMMENT 'UUID único de la categoría',
	`user_id` char(36) COMMENT 'NULL = categoría global del sistema, UUID = categoría personalizada del usuario',
	`type` enum('income','expense') NOT NULL COMMENT 'Define si la categoría es para ingresos o gastos',
	`name` varchar(100) NOT NULL COMMENT 'Nombre de la categoría',
	`icon` varchar(50) COMMENT 'Nombre/icono visual opcional',
	`color` varchar(20) COMMENT 'Color opcional para UI',
	`parent_id` char(36) COMMENT 'Permite subcategorías. Ejemplo: Food → Fast Food',
	`sort_order` decimal NOT NULL DEFAULT '0' COMMENT 'Orden visual en listados',
	`is_active` boolean NOT NULL DEFAULT true COMMENT 'Permite desactivar categorías sin borrarlas',
	`is_system` boolean NOT NULL DEFAULT false COMMENT 'Indica si pertenece al sistema',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación',
	`updated_at` datetime(3) NOT NULL COMMENT 'Última actualización',
	`deleted_at` datetime(3) COMMENT 'Soft delete',
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Categorías de movimientos financieros';
--> statement-breakpoint
CREATE TABLE `couple_members` (
	`id` char(36) NOT NULL COMMENT 'UUID del registro relación usuario-pareja',
	`couple_id` char(36) NOT NULL COMMENT 'Pareja/grupo al que pertenece',
	`user_id` char(36) NOT NULL COMMENT 'Usuario integrante',
	`role` enum('owner','member') NOT NULL DEFAULT 'member' COMMENT 'Permisos dentro del grupo',
	`joined_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de ingreso al grupo',
	CONSTRAINT `couple_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `couple_members_couple_id_user_id_key` UNIQUE(`couple_id`,`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Relación usuario-pareja';
--> statement-breakpoint
CREATE TABLE `couples` (
	`id` char(36) NOT NULL COMMENT 'UUID único de la pareja/grupo financiero',
	`created_by` char(36) NOT NULL COMMENT 'Usuario que creó la pareja',
	`name` varchar(120) COMMENT 'Nombre opcional del espacio compartido',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active' COMMENT 'Estado del grupo',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación',
	`updated_at` datetime(3) NOT NULL COMMENT 'Última actualización',
	CONSTRAINT `couples_id` PRIMARY KEY(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Parejas/grupos financieros compartidos';
--> statement-breakpoint
CREATE TABLE `debt_payments` (
	`id` char(36) NOT NULL COMMENT 'UUID del pago realizado',
	`debt_id` char(36) NOT NULL COMMENT 'Deuda asociada',
	`user_id` char(36) NOT NULL COMMENT 'Usuario que realizó el pago',
	`amount` decimal(19,4) NOT NULL COMMENT 'Monto pagado',
	`payment_date` datetime(3) NOT NULL COMMENT 'Fecha del pago',
	`notes` varchar(255) COMMENT 'Observaciones opcionales',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación',
	CONSTRAINT `debt_payments_id` PRIMARY KEY(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Pagos realizados a deudas';
--> statement-breakpoint
CREATE TABLE `debts` (
	`id` char(36) NOT NULL COMMENT 'UUID de la deuda',
	`user_id` char(36) NOT NULL COMMENT 'Usuario propietario de la deuda',
	`couple_id` char(36) COMMENT 'Relación opcional con deuda compartida',
	`title` varchar(150) NOT NULL COMMENT 'Nombre corto de la deuda',
	`description` varchar(255) COMMENT 'Información adicional',
	`initial_amount` decimal(19,4) NOT NULL COMMENT 'Valor original de la deuda',
	`current_amount` decimal(19,4) NOT NULL COMMENT 'Saldo pendiente actual',
	`interest_rate` decimal(10,4) NOT NULL DEFAULT '0' COMMENT 'Tasa de interés',
	`minimum_payment` decimal(19,4) NOT NULL DEFAULT '0' COMMENT 'Pago mínimo esperado',
	`due_day` tinyint COMMENT 'Día del mes límite de pago',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium' COMMENT 'Prioridad para recomendaciones',
	`status` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending' COMMENT 'Estado actual de la deuda',
	`start_date` datetime(3) COMMENT 'Fecha de inicio',
	`end_date` datetime(3) COMMENT 'Fecha estimada de finalización',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación',
	`updated_at` datetime(3) NOT NULL COMMENT 'Última actualización',
	`deleted_at` datetime(3) COMMENT 'Soft delete',
	CONSTRAINT `debts_id` PRIMARY KEY(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Deudas registradas por el usuario';
--> statement-breakpoint
CREATE TABLE `movements` (
	`id` char(36) NOT NULL COMMENT 'UUID del movimiento financiero',
	`user_id` char(36) NOT NULL COMMENT 'Usuario propietario del movimiento',
	`couple_id` char(36) COMMENT 'Relación opcional con finanzas compartidas',
	`category_id` char(36) NOT NULL COMMENT 'Categoría del movimiento',
	`type` enum('income','expense') NOT NULL COMMENT 'Tipo de movimiento',
	`amount` decimal(19,4) NOT NULL COMMENT 'Valor monetario preciso',
	`description` varchar(255) COMMENT 'Descripción opcional',
	`movement_date` datetime(3) NOT NULL COMMENT 'Fecha efectiva del movimiento',
	`is_shared` boolean NOT NULL DEFAULT false COMMENT 'Indica si afecta finanzas compartidas',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación',
	`updated_at` datetime(3) NOT NULL COMMENT 'Última actualización',
	`deleted_at` datetime(3) COMMENT 'Soft delete',
	CONSTRAINT `movements_id` PRIMARY KEY(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Movimientos financieros (ingresos/gastos)';
--> statement-breakpoint
CREATE TABLE `token_blacklist` (
	`id` char(36) NOT NULL COMMENT 'UUID único del token en blacklist',
	`token` text NOT NULL COMMENT 'Token JWT invalidado al hacer logout',
	`expires_at` datetime(3) NOT NULL COMMENT 'Fecha de expiración del token (para limpieza programada)',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de registro en blacklist',
	CONSTRAINT `token_blacklist_id` PRIMARY KEY(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Tokens JWT invalidados en logout';
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL COMMENT 'UUID único del usuario',
	`name` varchar(120) NOT NULL COMMENT 'Nombre visible del usuario',
	`email` varchar(190) NOT NULL COMMENT 'Correo único para autenticación',
	`password_hash` varchar(255) NOT NULL COMMENT 'Contraseña hasheada con bcrypt',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active' COMMENT 'Estado lógico de la cuenta',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación',
	`updated_at` datetime(3) NOT NULL COMMENT 'Última actualización',
	`deleted_at` datetime(3) COMMENT 'Soft delete',
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_email_key` UNIQUE(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Tabla de usuarios del sistema';
--> statement-breakpoint
CREATE INDEX `idx_categories_user_id` ON `categories` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_categories_type` ON `categories` (`type`);--> statement-breakpoint
CREATE INDEX `idx_categories_parent_id` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `idx_couple_members_user_id` ON `couple_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_couples_created_by` ON `couples` (`created_by`);--> statement-breakpoint
CREATE INDEX `idx_debt_payments_debt_id` ON `debt_payments` (`debt_id`);--> statement-breakpoint
CREATE INDEX `idx_debt_payments_user_id` ON `debt_payments` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_debts_user_id` ON `debts` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_debts_couple_id` ON `debts` (`couple_id`);--> statement-breakpoint
CREATE INDEX `idx_debts_status` ON `debts` (`status`);--> statement-breakpoint
CREATE INDEX `idx_movements_user_id` ON `movements` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_movements_couple_id` ON `movements` (`couple_id`);--> statement-breakpoint
CREATE INDEX `idx_movements_category_id` ON `movements` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_movements_type_date` ON `movements` (`type`,`movement_date`);--> statement-breakpoint
CREATE INDEX `idx_token_blacklist_token` ON `token_blacklist` (`token`);
