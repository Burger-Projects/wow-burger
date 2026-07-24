/**
 * Seed default admin + sample menu items.
 * Usage: node scripts/seed.js
 * Env: DB_* from .env, optional SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME
 */
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

    const [categories] = await connection.execute(
      "SELECT id, slug FROM categories",
    );
    const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

    const [itemCount] = await connection.execute(
      "SELECT COUNT(*) AS count FROM menu_items",
    );

    if (Number(itemCount[0].count) === 0 && bySlug.classic) {
      const samples = [
        [
          bySlug.classic,
          "Classic Beef Burger",
          "Juicy beef patty with lettuce, tomato, onions, and signature sauce",
          12.99,
        ],
        [
          bySlug.classic,
          "Double Cheese Deluxe",
          "Double beef patties with melted cheddar, pickles, and special sauce",
          16.99,
        ],
        [
          bySlug.premium || bySlug.classic,
          "BBQ Bacon Smash",
          "Smoked bacon, caramelized onions, BBQ sauce, and crispy onion rings",
          18.99,
        ],
        [
          bySlug.spicy || bySlug.classic,
          "Spicy Jalapeño",
          "Pepper jack cheese, jalapeños, hot sauce, and cool ranch dressing",
          14.99,
        ],
        [
          bySlug.veggie || bySlug.classic,
          "Veggie Garden",
          "Plant-based patty, fresh greens, roasted peppers, and hummus",
          13.99,
        ],
      ];

      for (const [categoryId, name, description, price] of samples) {
        await connection.execute(
          `INSERT INTO menu_items (category_id, name, description, price, is_available)
           VALUES (?, ?, ?, ?, 1)`,
          [categoryId, name, description, price],
        );
      }
      console.log(`Seeded ${samples.length} menu items`);
    } else {
      console.log("Menu items already present — skipping sample insert");
    }

    const [branchCount] = await connection.execute(
      "SELECT COUNT(*) AS count FROM branches",
    );

    if (Number(branchCount[0].count) === 0) {
      await connection.execute(
        `INSERT INTO branches
          (name, address, city, phone, email, hours, latitude, longitude, is_primary, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 0)`,
        [
          "Burger House Downtown",
          "123 Burger Avenue, Foodie District",
          "New York, NY 10001",
          "+1 (555) 123-4567",
          "hello@burgerhouse.com",
          "Mon – Fri: 10:00 AM – 11:00 PM\nSat – Sun: 9:00 AM – 12:00 AM",
          40.758,
          -73.9855,
        ],
      );
      console.log("Seeded sample branch");
    } else {
      console.log("Branches already present — skipping sample insert");
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
