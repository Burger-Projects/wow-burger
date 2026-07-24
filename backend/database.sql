-- ============================================================
-- Burger House Database Schema (MySQL Compatible with UUIDs)
-- ============================================================

CREATE DATABASE IF NOT EXISTS menu_website;
USE menu_website;

-- 1. USERS TABLE (Admins, Supervisors, Workers)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN', -- e.g., 'ADMIN', 'WORKER', 'SUPERVISOR'
    company_id VARCHAR(36) NULL,
    branch_id VARCHAR(36) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. MENU CATEGORIES (Burgers, Sides, Drinks, Desserts)
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. MENU ITEMS (Admin CRUD)
CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500) NULL,
    is_available TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_items_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. REVIEWS (Customer Submission & Admin Moderation)
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    customer_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_approved TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. STORE INFO (Dynamic Landing Page Content)
CREATE TABLE IF NOT EXISTS store_info (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `key` VARCHAR(50) NOT NULL UNIQUE,
    `value` TEXT NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);

-- ============================================================
-- INITIAL SEED DATA
-- ============================================================

-- Seed Categories
INSERT IGNORE INTO categories (id, name, slug) VALUES
('10000000-0000-0000-0000-000000000101', 'Burgers', 'burgers'),
('10000000-0000-0000-0000-000000000102', 'Sides', 'sides'),
('10000000-0000-0000-0000-000000000103', 'Drinks', 'drinks'),
('10000000-0000-0000-0000-000000000104', 'Desserts', 'desserts');

-- Seed Store Info
INSERT IGNORE INTO store_info (id, `key`, `value`) VALUES
('20000000-0000-0000-0000-000000000201', 'opening_hours', 'Mon - Sun: 10:00 AM - 11:00 PM'),
('20000000-0000-0000-0000-000000000202', 'address', '123 Burger Street, Foodville, FC 12345'),
('20000000-0000-0000-0000-000000000203', 'phone', '+1 (555) 019-2834'),
('20000000-0000-0000-0000-000000000204', 'about_text', 'Serving the juiciest handcrafted burgers in town since 2020!');
