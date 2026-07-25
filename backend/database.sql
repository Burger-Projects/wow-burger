-- Burger House / Menu Website — MySQL schema
-- Run: mysql -u root -p < database.sql
-- Then: npm run seed   (creates default admin)

CREATE DATABASE IF NOT EXISTS menu_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE menu_website;

-- 1. USERS (admin = store staff, customer = public users)
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
);


-- 2. MENU CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500) NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_menu_items_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_menu_items_available (is_available),
  INDEX idx_menu_items_category (category_id)
);

-- 4. CUSTOMER FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  menu_item_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_item (user_id, menu_item_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_item
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- 6. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NOT NULL,
  is_approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
);

<<<<<<< HEAD
-- 7. MENU ITEM RATINGS
CREATE TABLE IF NOT EXISTS menu_item_ratings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  menu_item_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_menu_ratings_item
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  CONSTRAINT chk_menu_item_rating CHECK (rating BETWEEN 1 AND 5)
);

-- 8. STORE INFO
=======
-- 6. STORE INFO (brand-level key/value settings)
>>>>>>> 1060f49d0686eff03fcd0cbcf28b6005ae0e5739
CREATE TABLE IF NOT EXISTS store_info (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  info_key VARCHAR(50) NOT NULL UNIQUE,
  info_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. BRANCHES (one or more store locations for contact map)
CREATE TABLE IF NOT EXISTS branches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(255) NULL,
  hours TEXT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_branches_active (is_active),
  INDEX idx_branches_sort (sort_order)
);

-- Seed categories
INSERT INTO categories (name, slug) VALUES
  ('Classic', 'classic'),
  ('Premium', 'premium'),
  ('Spicy', 'spicy'),
  ('Veggie', 'veggie')
ON DUPLICATE KEY UPDATE name = VALUES(name);
