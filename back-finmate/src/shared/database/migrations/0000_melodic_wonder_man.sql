CREATE TABLE `categories` (
	`id` char(36) NOT NULL COMMENT 'Identificador único de la categoría (UUID v4)',
	`user_id` char(36) COMMENT 'ID del usuario propietario (NULL si es categoría del sistema)',
	`type` enum('income','expense') NOT NULL COMMENT 'Tipo de categoría: ingreso o gasto',
	`name` varchar(100) NOT NULL COMMENT 'Nombre de la categoría',
	`icon` varchar(50) COMMENT 'Icono representativo (Material Icons)',
	`is_system` boolean NOT NULL DEFAULT false COMMENT 'Indica si es categoría del sistema (no editable por el usuario)',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación del registro',
	`updated_at` datetime(3) NOT NULL COMMENT 'Fecha de última actualización',
	`deleted_at` datetime(3) COMMENT 'Fecha de borrado lógico',
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `couple_goals` (
	`id` char(36) NOT NULL COMMENT 'Identificador único de la meta (UUID v4)',
	`couple_id` char(36) NOT NULL COMMENT 'ID de la pareja propietaria',
	`title` varchar(150) NOT NULL COMMENT 'Título de la meta financiera',
	`target_amount` decimal(19,4) NOT NULL COMMENT 'Monto objetivo a alcanzar',
	`current_amount` decimal(19,4) NOT NULL DEFAULT '0' COMMENT 'Monto actual ahorrado',
	`deadline` datetime(3) COMMENT 'Fecha límite para cumplir la meta',
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active' COMMENT 'Estado: activa, completada o cancelada',
	`created_by` char(36) NOT NULL COMMENT 'ID del usuario que creó la meta',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación del registro',
	`updated_at` datetime(3) NOT NULL COMMENT 'Fecha de última actualización',
	`deleted_at` datetime(3) COMMENT 'Fecha de borrado lógico',
	CONSTRAINT `couple_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `couple_invitations` (
	`id` char(36) NOT NULL COMMENT 'Identificador único de la invitación (UUID v4)',
	`couple_id` char(36) NOT NULL COMMENT 'ID de la pareja que invita',
	`invited_email` varchar(190) NOT NULL COMMENT 'Correo electrónico del invitado',
	`status` enum('pending','accepted','declined','expired') NOT NULL DEFAULT 'pending' COMMENT 'Estado: pendiente, aceptada, rechazada o expirada',
	`expires_at` datetime(3) NOT NULL COMMENT 'Fecha de expiración de la invitación',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación del registro',
	`updated_at` datetime(3) NOT NULL COMMENT 'Fecha de última actualización',
	CONSTRAINT `couple_invitations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `couple_members` (
	`id` char(36) NOT NULL COMMENT 'Identificador único del miembro (UUID v4)',
	`couple_id` char(36) NOT NULL COMMENT 'ID de la pareja a la que pertenece',
	`user_id` char(36) NOT NULL COMMENT 'ID del usuario miembro',
	`role` enum('owner','member') NOT NULL DEFAULT 'member' COMMENT 'Rol del miembro: propietario (owner) o miembro (member)',
	`joined_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha en que el usuario se unió a la pareja',
	CONSTRAINT `couple_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `couple_members_couple_id_user_id_key` UNIQUE(`couple_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `couples` (
	`id` char(36) NOT NULL COMMENT 'Identificador único de la pareja (UUID v4)',
	`created_by` char(36) NOT NULL COMMENT 'ID del usuario que creó la pareja',
	`name` varchar(120) NOT NULL COMMENT 'Nombre descriptivo de la pareja',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active' COMMENT 'Estado de la pareja: activo o inactivo',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación del registro',
	`updated_at` datetime(3) NOT NULL COMMENT 'Fecha de última actualización',
	CONSTRAINT `couples_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_payments` (
	`id` char(36) NOT NULL COMMENT 'Identificador único del pago (UUID v4)',
	`debt_id` char(36) NOT NULL COMMENT 'ID de la deuda asociada',
	`user_id` char(36) NOT NULL COMMENT 'ID del usuario que realizó el pago',
	`amount` decimal(19,4) NOT NULL COMMENT 'Monto del pago realizado',
	`payment_date` datetime(3) NOT NULL COMMENT 'Fecha en que se efectuó el pago',
	`notes` varchar(255) COMMENT 'Notas u observaciones del pago',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación del registro',
	CONSTRAINT `debt_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debts` (
	`id` char(36) NOT NULL COMMENT 'Identificador único de la deuda (UUID v4)',
	`user_id` char(36) NOT NULL COMMENT 'ID del usuario propietario',
	`couple_id` char(36) COMMENT 'ID de la pareja asociada (NULL si es individual)',
	`title` varchar(150) NOT NULL COMMENT 'Título o nombre de la deuda',
	`description` varchar(255) COMMENT 'Descripción detallada',
	`initial_amount` decimal(19,4) NOT NULL COMMENT 'Monto original de la deuda',
	`current_amount` decimal(19,4) NOT NULL COMMENT 'Saldo actual pendiente',
	`interest_rate` decimal(10,4) NOT NULL DEFAULT '0' COMMENT 'Tasa de interés anual en porcentaje',
	`minimum_payment` decimal(19,4) NOT NULL DEFAULT '0' COMMENT 'Pago mínimo mensual requerido',
	`due_day` tinyint COMMENT 'Día de vencimiento del pago (1-31)',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium' COMMENT 'Prioridad: baja, media o alta',
	`status` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending' COMMENT 'Estado: pendiente, pagada o vencida',
	`start_date` datetime(3) COMMENT 'Fecha de inicio o contratación',
	`end_date` datetime(3) COMMENT 'Fecha de liquidación o fin',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación del registro',
	`updated_at` datetime(3) NOT NULL COMMENT 'Fecha de última actualización',
	`deleted_at` datetime(3) COMMENT 'Fecha de borrado lógico',
	CONSTRAINT `debts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_contributions` (
	`id` char(36) NOT NULL COMMENT 'Identificador único de la contribución (UUID v4)',
	`goal_id` char(36) NOT NULL COMMENT 'ID de la meta asociada',
	`user_id` char(36) NOT NULL COMMENT 'ID del usuario que contribuyó',
	`amount` decimal(19,4) NOT NULL COMMENT 'Monto de la contribución',
	`notes` varchar(255) COMMENT 'Notas sobre la contribución',
	`date` datetime(3) NOT NULL COMMENT 'Fecha de la contribución',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación del registro',
	CONSTRAINT `goal_contributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `movements` (
	`id` char(36) NOT NULL COMMENT 'Identificador único del movimiento (UUID v4)',
	`user_id` char(36) NOT NULL COMMENT 'ID del usuario que realizó el movimiento',
	`couple_id` char(36) COMMENT 'ID de la pareja asociada (NULL si es individual)',
	`category_id` char(36) NOT NULL COMMENT 'ID de la categoría del movimiento',
	`type` enum('income','expense') NOT NULL COMMENT 'Tipo de movimiento: ingreso o gasto',
	`amount` decimal(19,4) NOT NULL COMMENT 'Monto del movimiento (19 dígitos, 4 decimales)',
	`description` varchar(255) COMMENT 'Descripción o nota del movimiento',
	`movement_date` datetime(3) NOT NULL COMMENT 'Fecha en que ocurrió el movimiento',
	`reference_type` varchar(50) COMMENT 'Tipo de referencia (debt_payment, goal_contribution)',
	`reference_id` char(36) COMMENT 'ID del registro origen',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación del registro',
	`updated_at` datetime(3) NOT NULL COMMENT 'Fecha de última actualización',
	`deleted_at` datetime(3) COMMENT 'Fecha de borrado lógico',
	CONSTRAINT `movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` char(36) NOT NULL COMMENT 'Identificador único del token (UUID v4)',
	`user_id` char(36) NOT NULL COMMENT 'ID del usuario que solicita el reinicio',
	`token` varchar(255) NOT NULL COMMENT 'Token criptográfico de reinicio',
	`expires_at` datetime(3) NOT NULL COMMENT 'Fecha de expiración del token',
	`used` boolean NOT NULL DEFAULT false COMMENT 'Indica si el token ya fue utilizado',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación del registro',
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_token_key` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` char(36) NOT NULL COMMENT 'Identificador único del token (UUID v4)',
	`user_id` char(36) NOT NULL COMMENT 'ID del usuario propietario del token',
	`expires_at` datetime(3) NOT NULL COMMENT 'Fecha de expiración del token',
	`revoked` boolean NOT NULL DEFAULT false COMMENT 'Indica si el token fue revocado',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación del registro',
	`updated_at` datetime(3) NOT NULL COMMENT 'Fecha de última actualización',
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL COMMENT 'Identificador único del usuario (UUID v4)',
	`name` varchar(120) NOT NULL COMMENT 'Nombre completo del usuario',
	`email` varchar(190) NOT NULL COMMENT 'Correo electrónico único del usuario',
	`password_hash` varchar(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña (10 rounds)',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active' COMMENT 'Estado de la cuenta: activo o inactivo',
	`email_verified_at` datetime(3) COMMENT 'Fecha de verificación del correo electrónico',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación del registro',
	`updated_at` datetime(3) NOT NULL COMMENT 'Fecha de última actualización',
	`deleted_at` datetime(3) COMMENT 'Fecha de borrado lógico (soft delete)',
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
CREATE INDEX `idx_movements_reference_type` ON `movements` (`reference_type`);--> statement-breakpoint
CREATE INDEX `idx_password_reset_user_id` ON `password_reset_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_refresh_tokens_user_id` ON `refresh_tokens` (`user_id`);