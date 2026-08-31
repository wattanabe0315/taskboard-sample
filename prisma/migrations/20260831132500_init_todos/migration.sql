-- CreateTable
CREATE TABLE `todos` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
