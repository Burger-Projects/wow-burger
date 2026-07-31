-- =========================================================
-- WOW Burger Supabase PostgreSQL Database Schema & Seeds
-- Host: db.ubvenobxalkbwmmmsgnk.supabase.co
-- =========================================================

-- 1. Create custom ENUM type for user roles if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN 
    CREATE TYPE user_role AS ENUM ('admin', 'customer'); 
  END IF; 
END $$;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500) NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items (is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items (category_id);

-- 5. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  menu_item_id INT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_item UNIQUE (user_id, menu_item_id)
);

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. MENU ITEM RATINGS TABLE
CREATE TABLE IF NOT EXISTS menu_item_ratings (
  id SERIAL PRIMARY KEY,
  menu_item_id INT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_menu_rating UNIQUE (menu_item_id, user_id)
);

-- 8. STORE INFO TABLE
CREATE TABLE IF NOT EXISTS store_info (
  id SERIAL PRIMARY KEY,
  info_key VARCHAR(50) NOT NULL UNIQUE,
  info_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. BRANCHES TABLE
CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(255) NULL,
  hours TEXT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_branches_active ON branches (is_active);
CREATE INDEX IF NOT EXISTS idx_branches_sort ON branches (sort_order);

-- 10. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_info_updated_at ON store_info;
CREATE TRIGGER update_store_info_updated_at BEFORE UPDATE ON store_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_branches_updated_at ON branches;
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================
-- SEED INITIAL DATA
-- =========================================================

-- Seed Categories
INSERT INTO categories (name, slug) VALUES
  ('Burgers', 'burgers'),
  ('Wraps & Sandwiches', 'wraps-sandwiches'),
  ('Pizza', 'pizza')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Seed Default WOW Burger Branch if none exists
INSERT INTO branches 
  (name, address, city, phone, email, hours, latitude, longitude, is_primary, is_active, sort_order)
SELECT 
  'WOW Burger Main Branch', 
  'Bole Road, Near Friendship Building', 
  'Addis Ababa, Ethiopia', 
  '+251 911 123 456', 
  'info@wowburger.et', 
  'Mon – Sun: 8:00 AM – 11:00 PM', 
  9.0105, 
  38.7612, 
  TRUE, 
  TRUE, 
  0
WHERE NOT EXISTS (SELECT 1 FROM branches);

-- Seed Menu Items
INSERT INTO menu_items (category_id, name, description, price, is_available) VALUES
  ((SELECT id FROM categories WHERE slug = 'burgers'), 'Wow Special Burger / ዋው ስፔሻል በርገር', 'Double Beef Patty, Double Slice Cheese, Double Slice Beef Mortadella, Fried Egg, Mayonnaise, Tomato, Lettuce', 868.70, TRUE),
  ((SELECT id FROM categories WHERE slug = 'burgers'), 'Wow Double Burger / ዋው ድርብ በርገር', 'Double Beef Patty, Double Cheese, Mayonnaise, Tomato, Lettuce', 781.74, TRUE),
  ((SELECT id FROM categories WHERE slug = 'burgers'), 'Cheese Burger / ቺዝ በርገር', 'Beef Patty, Slice Cheese, Mayonnaise, Tomato, Lettuce', 607.83, TRUE),
  ((SELECT id FROM categories WHERE slug = 'burgers'), 'Beef Burger / ቢፍ በርገር', 'Beef Patty, Mayonnaise, Tomato, Lettuce', 520.87, TRUE),
  ((SELECT id FROM categories WHERE slug = 'burgers'), 'Mini Special Burger / ሚኒ ስፔሻል በርገር', 'Beef Patty, Slice Cheese, Slice Beef Mortadella, Fried Egg, Mayonnaise, Tomato, Lettuce', 694.78, TRUE),
  ((SELECT id FROM categories WHERE slug = 'burgers'), 'Mini Burger / ሚኒ በርገር', 'Beef Patty, Mayonnaise, Tomato, Lettuce', 477.39, TRUE),
  ((SELECT id FROM categories WHERE slug = 'burgers'), 'Chicken Special Burger / ቺክን ስፔሻል በርገር', 'Grilled Marinated Chicken Breast, Slice Cheese, Slice Beef, Fried Egg, Mayonnaise, Tomato, Lettuce', 868.70, TRUE),
  ((SELECT id FROM categories WHERE slug = 'burgers'), 'Chicken Burger / ቺክን በርገር', 'Grilled Marinated Chicken Breast, Mayonnaise, Tomato, Lettuce', 738.26, TRUE),
  ((SELECT id FROM categories WHERE slug = 'burgers'), 'Chicken Burger with Choice of Topping', 'Chicken Burger with choice of slice cheese / Slice Beef Mortadella / Fried Egg', 781.74, TRUE),

  ((SELECT id FROM categories WHERE slug = 'wraps-sandwiches'), 'Chicken Wrap Big / ያደሮ Wrap Big', 'Grilled Chicken, Mozzarella Cheese, Beef Mortadella, Onion, Tomato, chili pepper', 999.13, TRUE),
  ((SELECT id FROM categories WHERE slug = 'wraps-sandwiches'), 'Chicken Wrap Medium / ያደሮ Wrap Medium', 'Grilled Chicken, Mozzarella Cheese, Beef Mortadella, Onion, Tomato, chili pepper', 825.22, TRUE),
  ((SELECT id FROM categories WHERE slug = 'wraps-sandwiches'), 'Fish Wrap / አሳ Wrap', 'Grilled Fish, Onion, Tomato, chili pepper', 825.22, TRUE),
  ((SELECT id FROM categories WHERE slug = 'wraps-sandwiches'), 'Tuna Wrap Big / ቱና Wrap Big', 'Tuna, Onion, Tomato, chili pepper', 868.70, TRUE),
  ((SELECT id FROM categories WHERE slug = 'wraps-sandwiches'), 'Tuna Wrap Medium / ቱና Wrap Medium', 'Tuna, Onion, Tomato, chili pepper', 781.74, TRUE),
  ((SELECT id FROM categories WHERE slug = 'wraps-sandwiches'), 'Vegetable Wrap / የአትክልት Wrap', 'Mix of Well Cooked Vegetables', 607.83, TRUE),
  ((SELECT id FROM categories WHERE slug = 'wraps-sandwiches'), 'Egg Sandwich / እንቁላል ሳንድዊች', 'Fried egg, Mayonnaise, Tomato, Lettuce', 390.44, TRUE),
  ((SELECT id FROM categories WHERE slug = 'wraps-sandwiches'), 'Cheese Sandwich / ቺዝ ሳንድዊች', 'Slice Cheese, Mayonnaise, Tomato, Lettuce', 390.44, TRUE),
  ((SELECT id FROM categories WHERE slug = 'wraps-sandwiches'), 'Ham & Cheese Sandwich / ሃም & ቺዝ ሳንድዊች', 'Slice Beef Mortadella, Slice Cheese, Mayonnaise, Tomato, Lettuce, chili pepper', 433.91, TRUE),
  ((SELECT id FROM categories WHERE slug = 'wraps-sandwiches'), 'Tuna Sandwich / ቱና ሳንድዊች', 'Tuna, Tomato, Onion, Ketchup', 738.26, TRUE),
  ((SELECT id FROM categories WHERE slug = 'wraps-sandwiches'), 'Vegetable Sandwich / የአትክልት ሳንድዊች', 'Mix of well cooked vegetables', 520.87, TRUE),
  ((SELECT id FROM categories WHERE slug = 'wraps-sandwiches'), 'French Fries / ፍሬንች ፍራይስ', 'Crispy golden french fries', 433.91, TRUE),

  ((SELECT id FROM categories WHERE slug = 'pizza'), 'Wow Special Pizza / ዋው ስፔሻል ፒዛ', 'Tomato Sauce, Mozzarella Cheese, Beef, Beef Mortadella, Chicken, Green Pepper, Onion, Egg, Mushroom, Olive, Oregano', 938.26, TRUE),
  ((SELECT id FROM categories WHERE slug = 'pizza'), 'Chicken Pizza / ቺክን ፒዛ', 'Tomato Sauce, Mozzarella Cheese, Chicken, Onion, Oregano', 825.22, TRUE),
  ((SELECT id FROM categories WHERE slug = 'pizza'), 'BBQ Chicken Wing', 'Crispy BBQ chicken wings served with Fries and Coleslaw', 720.87, TRUE),
  ((SELECT id FROM categories WHERE slug = 'pizza'), 'Margarita Pizza / ማርጋሪታ ፒዛ', 'Tomato Sauce, Mozzarella Cheese, Oregano', 564.35, TRUE),
  ((SELECT id FROM categories WHERE slug = 'pizza'), 'Meat Lover / Beef Pizza / ሚት ላቨር ፒዛ', 'Tomato Sauce, Mozzarella Cheese, Beef, Green Pepper, White Onion, Oregano', 781.74, TRUE),
  ((SELECT id FROM categories WHERE slug = 'pizza'), 'Pizzala Pizza / ፒዛላ ፒዛ', 'Tomato Sauce, Mozzarella Cheese, Burger Beef, Slice Tomato, Oregano', 781.74, TRUE),
  ((SELECT id FROM categories WHERE slug = 'pizza'), 'Chicken Pesto Pizza', 'Pesto sauce, Mozzarella Cheese, Chicken, Cherry Tomatoes', 781.74, TRUE),
  ((SELECT id FROM categories WHERE slug = 'pizza'), 'Hawaiian Pizza', 'Tomato Sauce, Mozzarella Cheese, Mortadella Beef, Pineapple, Red Onion', 781.74, TRUE),
  ((SELECT id FROM categories WHERE slug = 'pizza'), 'Tuna Pizza / ቱና ፒዛ', 'Tomato Sauce, Mozzarella Cheese, Tuna, Onion', 825.22, TRUE),
  ((SELECT id FROM categories WHERE slug = 'pizza'), 'Vegetable Pizza / የአትክልት ፒዛ', 'Tomato Sauce, Zucchini, Eggplant, Red Pepper, Fasting Oregano', 520.87, TRUE)
ON CONFLICT DO NOTHING;
