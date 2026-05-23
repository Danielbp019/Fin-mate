-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID único del usuario',
    `name` VARCHAR(120) NOT NULL COMMENT 'Nombre visible del usuario',
    `email` VARCHAR(190) NOT NULL COMMENT 'Correo único para autenticación',
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada con bcrypt',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'Estado lógico de la cuenta',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación',
    `updated_at` DATETIME(3) NOT NULL COMMENT 'Última actualización',
    `deleted_at` DATETIME NULL COMMENT 'Soft delete',

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Tabla de usuarios del sistema';

-- CreateTable
CREATE TABLE `categories` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID único de la categoría',
    `user_id` CHAR(36) NULL COMMENT 'NULL = categoría global del sistema, UUID = categoría personalizada del usuario',
    `type` ENUM('income', 'expense') NOT NULL COMMENT 'Define si la categoría es para ingresos o gastos',
    `name` VARCHAR(100) NOT NULL COMMENT 'Nombre de la categoría',
    `icon` VARCHAR(50) NULL COMMENT 'Nombre/icono visual opcional',
    `color` VARCHAR(20) NULL COMMENT 'Color opcional para UI',
    `parent_id` CHAR(36) NULL COMMENT 'Permite subcategorías. Ejemplo: Food → Fast Food',
    `sort_order` INTEGER NOT NULL DEFAULT 0 COMMENT 'Orden visual en listados',
    `is_active` BOOLEAN NOT NULL DEFAULT true COMMENT 'Permite desactivar categorías sin borrarlas',
    `is_system` BOOLEAN NOT NULL DEFAULT false COMMENT 'Indica si pertenece al sistema',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación',
    `updated_at` DATETIME(3) NOT NULL COMMENT 'Última actualización',
    `deleted_at` DATETIME NULL COMMENT 'Soft delete',

    INDEX `idx_categories_user_id`(`user_id`),
    INDEX `idx_categories_type`(`type`),
    INDEX `idx_categories_parent_id`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Categorías de movimientos financieros';

-- CreateTable
CREATE TABLE `couples` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID único de la pareja/grupo financiero',
    `created_by` CHAR(36) NOT NULL COMMENT 'Usuario que creó la pareja',
    `name` VARCHAR(120) NULL COMMENT 'Nombre opcional del espacio compartido',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'Estado del grupo',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación',
    `updated_at` DATETIME(3) NOT NULL COMMENT 'Última actualización',

    INDEX `idx_couples_created_by`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Parejas/grupos financieros compartidos';

-- CreateTable
CREATE TABLE `couple_members` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID del registro relación usuario-pareja',
    `couple_id` CHAR(36) NOT NULL COMMENT 'Pareja/grupo al que pertenece',
    `user_id` CHAR(36) NOT NULL COMMENT 'Usuario integrante',
    `role` ENUM('owner', 'member') NOT NULL DEFAULT 'member' COMMENT 'Permisos dentro del grupo',
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de ingreso al grupo',

    INDEX `idx_couple_members_user_id`(`user_id`),
    UNIQUE INDEX `couple_members_couple_id_user_id_key`(`couple_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Relación usuario-pareja';

-- CreateTable
CREATE TABLE `movements` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID del movimiento financiero',
    `user_id` CHAR(36) NOT NULL COMMENT 'Usuario propietario del movimiento',
    `couple_id` CHAR(36) NULL COMMENT 'Relación opcional con finanzas compartidas',
    `category_id` CHAR(36) NOT NULL COMMENT 'Categoría del movimiento',
    `type` ENUM('income', 'expense') NOT NULL COMMENT 'Tipo de movimiento',
    `amount` DECIMAL(19, 4) NOT NULL COMMENT 'Valor monetario preciso',
    `description` VARCHAR(255) NULL COMMENT 'Descripción opcional',
    `movement_date` DATE NOT NULL COMMENT 'Fecha efectiva del movimiento',
    `is_shared` BOOLEAN NOT NULL DEFAULT false COMMENT 'Indica si afecta finanzas compartidas',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación',
    `updated_at` DATETIME(3) NOT NULL COMMENT 'Última actualización',
    `deleted_at` DATETIME NULL COMMENT 'Soft delete',

    INDEX `idx_movements_user_id`(`user_id`),
    INDEX `idx_movements_couple_id`(`couple_id`),
    INDEX `idx_movements_category_id`(`category_id`),
    INDEX `idx_movements_type_date`(`type`, `movement_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Movimientos financieros (ingresos/gastos)';

-- CreateTable
CREATE TABLE `debts` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID de la deuda',
    `user_id` CHAR(36) NOT NULL COMMENT 'Usuario propietario de la deuda',
    `couple_id` CHAR(36) NULL COMMENT 'Relación opcional con deuda compartida',
    `title` VARCHAR(150) NOT NULL COMMENT 'Nombre corto de la deuda',
    `description` VARCHAR(255) NULL COMMENT 'Información adicional',
    `initial_amount` DECIMAL(19, 4) NOT NULL COMMENT 'Valor original de la deuda',
    `current_amount` DECIMAL(19, 4) NOT NULL COMMENT 'Saldo pendiente actual',
    `interest_rate` DECIMAL(10, 4) NOT NULL DEFAULT 0 COMMENT 'Tasa de interés',
    `minimum_payment` DECIMAL(19, 4) NOT NULL DEFAULT 0 COMMENT 'Pago mínimo esperado',
    `due_day` TINYINT NULL COMMENT 'Día del mes límite de pago',
    `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium' COMMENT 'Prioridad para recomendaciones',
    `status` ENUM('pending', 'paid', 'overdue') NOT NULL DEFAULT 'pending' COMMENT 'Estado actual de la deuda',
    `start_date` DATE NULL COMMENT 'Fecha de inicio',
    `end_date` DATE NULL COMMENT 'Fecha estimada de finalización',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación',
    `updated_at` DATETIME(3) NOT NULL COMMENT 'Última actualización',
    `deleted_at` DATETIME NULL COMMENT 'Soft delete',

    INDEX `idx_debts_user_id`(`user_id`),
    INDEX `idx_debts_couple_id`(`couple_id`),
    INDEX `idx_debts_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Deudas registradas por el usuario';

-- CreateTable
CREATE TABLE `debt_payments` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID del pago realizado',
    `debt_id` CHAR(36) NOT NULL COMMENT 'Deuda asociada',
    `user_id` CHAR(36) NOT NULL COMMENT 'Usuario que realizó el pago',
    `amount` DECIMAL(19, 4) NOT NULL COMMENT 'Monto pagado',
    `payment_date` DATE NOT NULL COMMENT 'Fecha del pago',
    `notes` VARCHAR(255) NULL COMMENT 'Observaciones opcionales',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de creación',

    INDEX `idx_debt_payments_debt_id`(`debt_id`),
    INDEX `idx_debt_payments_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Pagos realizados a deudas';

-- CreateTable
CREATE TABLE `token_blacklist` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID único del token en blacklist',
    `token` TEXT NOT NULL COMMENT 'Token JWT invalidado al hacer logout',
    `expires_at` DATETIME(3) NOT NULL COMMENT 'Fecha de expiración del token (para limpieza programada)',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Fecha de registro en blacklist',

    INDEX `idx_token_blacklist_token`(`token`(255)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT = 'Tokens JWT invalidados en logout';

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couples` ADD CONSTRAINT `couples_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couple_members` ADD CONSTRAINT `couple_members_couple_id_fkey` FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couple_members` ADD CONSTRAINT `couple_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movements` ADD CONSTRAINT `movements_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movements` ADD CONSTRAINT `movements_couple_id_fkey` FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movements` ADD CONSTRAINT `movements_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debts` ADD CONSTRAINT `debts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debts` ADD CONSTRAINT `debts_couple_id_fkey` FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debt_payments` ADD CONSTRAINT `debt_payments_debt_id_fkey` FOREIGN KEY (`debt_id`) REFERENCES `debts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debt_payments` ADD CONSTRAINT `debt_payments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
