import dotenv from "dotenv";
import bcrypt from "bcrypt";
import pool from "../database.js";

dotenv.config();

const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || "admin@burgerhouse.com")
  .trim()
  .toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Store Admin";

async function seed() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existingAdmin] = await connection.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [ADMIN_EMAIL],
    );

    if (existingAdmin.length === 0) {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await connection.execute(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
        [ADMIN_NAME, ADMIN_EMAIL, passwordHash],
      );
      console.log(`Admin created: ${ADMIN_EMAIL}`);
    } else {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    }

    // Seed Categories
    const categoriesData = [
      ["Burgers", "burgers"],
      ["Wraps & Sandwiches", "wraps-sandwiches"],
      ["Pizza", "pizza"],
    ];

    for (const [name, slug] of categoriesData) {
      await connection.execute(
        "INSERT INTO categories (name, slug) VALUES (?, ?) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name",
        [name, slug]
      );
    }

    const [categories] = await connection.execute(
      "SELECT id, slug FROM categories",
    );
    const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

    // Wipe previous sample items if replacing with official menu
    await connection.execute("DELETE FROM menu_items");

    const wowMenuItems = [
      // BURGERS
      [
        bySlug["burgers"],
        "Wow Special Burger / ዋው ስፔሻል በርገር",
        "Double Beef Patty, Double Slice Cheese, Double Slice Beef Mortadella, Fried Egg, Mayonnaise, Tomato, Lettuce",
        868.70,
      ],
      [
        bySlug["burgers"],
        "Wow Double Burger / ዋው ድርብ በርገር",
        "Double Beef Patty, Double Cheese, Mayonnaise, Tomato, Lettuce",
        781.74,
      ],
      [
        bySlug["burgers"],
        "Cheese Burger / ቺዝ በርገር",
        "Beef Patty, Slice Cheese, Mayonnaise, Tomato, Lettuce",
        607.83,
      ],
      [
        bySlug["burgers"],
        "Beef Burger / ቢፍ በርገር",
        "Beef Patty, Mayonnaise, Tomato, Lettuce",
        520.87,
      ],
      [
        bySlug["burgers"],
        "Mini Special Burger / ሚኒ ስፔሻል በርገር",
        "Beef Patty, Slice Cheese, Slice Beef Mortadella, Fried Egg, Mayonnaise, Tomato, Lettuce",
        694.78,
      ],
      [
        bySlug["burgers"],
        "Mini Burger / ሚኒ በርገር",
        "Beef Patty, Mayonnaise, Tomato, Lettuce",
        477.39,
      ],
      [
        bySlug["burgers"],
        "Chicken Special Burger / ቺክን ስፔሻል በርገር",
        "Grilled Marinated Chicken Breast, Slice Cheese, Slice Beef, Fried Egg, Mayonnaise, Tomato, Lettuce",
        868.70,
      ],
      [
        bySlug["burgers"],
        "Chicken Burger / ቺክን በርገር",
        "Grilled Marinated Chicken Breast, Mayonnaise, Tomato, Lettuce",
        738.26,
      ],
      [
        bySlug["burgers"],
        "Chicken Burger with Choice of Topping",
        "Chicken Burger with choice of slice cheese / Slice Beef Mortadella / Fried Egg",
        781.74,
      ],

      // WRAPS & SANDWICHES
      [
        bySlug["wraps-sandwiches"],
        "Chicken Wrap Big / ያደሮ Wrap Big",
        "Grilled Chicken, Mozzarella Cheese, Beef Mortadella, Onion, Tomato, chili pepper",
        999.13,
      ],
      [
        bySlug["wraps-sandwiches"],
        "Chicken Wrap Medium / ያደሮ Wrap Medium",
        "Grilled Chicken, Mozzarella Cheese, Beef Mortadella, Onion, Tomato, chili pepper",
        825.22,
      ],
      [
        bySlug["wraps-sandwiches"],
        "Fish Wrap / አሳ Wrap",
        "Grilled Fish, Onion, Tomato, chili pepper",
        825.22,
      ],
      [
        bySlug["wraps-sandwiches"],
        "Tuna Wrap Big / ቱና Wrap Big",
        "Tuna, Onion, Tomato, chili pepper",
        868.70,
      ],
      [
        bySlug["wraps-sandwiches"],
        "Tuna Wrap Medium / ቱና Wrap Medium",
        "Tuna, Onion, Tomato, chili pepper",
        781.74,
      ],
      [
        bySlug["wraps-sandwiches"],
        "Vegetable Wrap / የአትክልት Wrap",
        "Mix of Well Cooked Vegetables",
        607.83,
      ],
      [
        bySlug["wraps-sandwiches"],
        "Egg Sandwich / እንቁላል ሳንድዊች",
        "Fried egg, Mayonnaise, Tomato, Lettuce",
        390.44,
      ],
      [
        bySlug["wraps-sandwiches"],
        "Cheese Sandwich / ቺዝ ሳንድዊች",
        "Slice Cheese, Mayonnaise, Tomato, Lettuce",
        390.44,
      ],
      [
        bySlug["wraps-sandwiches"],
        "Ham & Cheese Sandwich / ሃም & ቺዝ ሳንድዊች",
        "Slice Beef Mortadella, Slice Cheese, Mayonnaise, Tomato, Lettuce, chili pepper",
        433.91,
      ],
      [
        bySlug["wraps-sandwiches"],
        "Tuna Sandwich / ቱና ሳንድዊች",
        "Tuna, Tomato, Onion, Ketchup",
        738.26,
      ],
      [
        bySlug["wraps-sandwiches"],
        "Vegetable Sandwich / የአትክልት ሳንድዊች",
        "Mix of well cooked vegetables",
        520.87,
      ],
      [
        bySlug["wraps-sandwiches"],
        "French Fries / ፍሬንች ፍራይስ",
        "Crispy golden french fries",
        433.91,
      ],

      // PIZZA LOVER
      [
        bySlug["pizza"],
        "Wow Special Pizza / ዋው ስፔሻል ፒዛ",
        "Tomato Sauce, Mozzarella Cheese, Beef, Beef Mortadella, Chicken, Green Pepper, Onion, Egg, Mushroom, Olive, Oregano",
        938.26,
      ],
      [
        bySlug["pizza"],
        "Chicken Pizza / ቺክን ፒዛ",
        "Tomato Sauce, Mozzarella Cheese, Chicken, Onion, Oregano",
        825.22,
      ],
      [
        bySlug["pizza"],
        "BBQ Chicken Wing",
        "Crispy BBQ chicken wings served with Fries and Coleslaw",
        720.87,
      ],
      [
        bySlug["pizza"],
        "Margarita Pizza / ማርጋሪታ ፒዛ",
        "Tomato Sauce, Mozzarella Cheese, Oregano",
        564.35,
      ],
      [
        bySlug["pizza"],
        "Meat Lover / Beef Pizza / ሚት ላቨር ፒዛ",
        "Tomato Sauce, Mozzarella Cheese, Beef, Green Pepper, White Onion, Oregano",
        781.74,
      ],
      [
        bySlug["pizza"],
        "Pizzala Pizza / ፒዛላ ፒዛ",
        "Tomato Sauce, Mozzarella Cheese, Burger Beef, Slice Tomato, Oregano",
        781.74,
      ],
      [
        bySlug["pizza"],
        "Chicken Pesto Pizza",
        "Pesto sauce, Mozzarella Cheese, Chicken, Cherry Tomatoes",
        781.74,
      ],
      [
        bySlug["pizza"],
        "Hawaiian Pizza",
        "Tomato Sauce, Mozzarella Cheese, Mortadella Beef, Pineapple, Red Onion",
        781.74,
      ],
      [
        bySlug["pizza"],
        "Tuna Pizza / ቱና ፒዛ",
        "Tomato Sauce, Mozzarella Cheese, Tuna, Onion",
        825.22,
      ],
      [
        bySlug["pizza"],
        "Vegetable Pizza / የአትክልት ፒዛ",
        "Tomato Sauce, Zucchini, Eggplant, Red Pepper, Fasting Oregano",
        520.87,
      ],
    ];

    for (const [categoryId, name, description, price] of wowMenuItems) {
      if (categoryId) {
        await connection.execute(
          `INSERT INTO menu_items (category_id, name, description, price, is_available)
           VALUES (?, ?, ?, ?, true)`,
          [categoryId, name, description, price],
        );
      }
    }
    console.log(`Seeded ${wowMenuItems.length} WOW Burger menu items`);

    const [branchCount] = await connection.execute(
      "SELECT COUNT(*) AS count FROM branches",
    );

    if (Number(branchCount[0].count) === 0) {
      await connection.execute(
        `INSERT INTO branches
          (name, address, city, phone, email, hours, latitude, longitude, is_primary, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, true, 0)`,
        [
          "WOW Burger Main Branch",
          "Bole Road, Near Friendship Building",
          "Addis Ababa, Ethiopia",
          "+251 911 123 456",
          "info@wowburger.et",
          "Mon – Sun: 8:00 AM – 11:00 PM",
          9.0105,
          38.7612,
        ],
      );
      console.log("Seeded sample branch");
    }

    await connection.commit();
    console.log("Seed complete");
  } catch (error) {
    await connection.rollback();
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();
