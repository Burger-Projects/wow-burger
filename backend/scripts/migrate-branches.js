/**
 * Create the branches table if missing (for existing databases).
 * Usage: node scripts/migrate-branches.js
 */
import dotenv from "dotenv";
import pool from "../database.js";

dotenv.config();

async function migrate() {
  try {
    await pool.execute(`
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
      )
    `);
    console.log("branches table ready");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
