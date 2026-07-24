import { Router } from "express";
import { z } from "zod";
import pool from "../../../database.js";
import authenticate from "../../../middleware/authenticate.js";

const favoritesRouter = Router();

const idSchema = z.coerce.number().int().positive();

favoritesRouter.use(authenticate(["customer", "admin"]));

/** GET /api/favorites — list current user's favorites (with menu item details) */
favoritesRouter.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT f.id AS favorite_id, f.created_at AS favorited_at,
              mi.id, mi.category_id, mi.name, mi.description, mi.price,
              mi.image_url, mi.is_available,
              c.name AS category_name, c.slug AS category_slug
       FROM favorites f
       INNER JOIN menu_items mi ON mi.id = f.menu_item_id
       LEFT JOIN categories c ON c.id = mi.category_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id],
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
});

/** GET /api/favorites/ids — lightweight list of favorite menu item ids */
favoritesRouter.get("/ids", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT menu_item_id FROM favorites WHERE user_id = ?",
      [req.user.id],
    );
    return res.json({
      success: true,
      data: rows.map((r) => r.menu_item_id),
    });
  } catch (error) {
    return next(error);
  }
});

/** POST /api/favorites/:menuItemId */
favoritesRouter.post("/:menuItemId", async (req, res, next) => {
  try {
    const parsed = idSchema.safeParse(req.params.menuItemId);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid menu item id" });
    }
    const menuItemId = parsed.data;

    const [items] = await pool.execute(
      "SELECT id FROM menu_items WHERE id = ? LIMIT 1",
      [menuItemId],
    );
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    try {
      await pool.execute(
        "INSERT INTO favorites (user_id, menu_item_id) VALUES (?, ?)",
        [req.user.id, menuItemId],
      );
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.json({ success: true, message: "Already in favorites" });
      }
      throw error;
    }

    return res.status(201).json({ success: true, message: "Added to favorites" });
  } catch (error) {
    return next(error);
  }
});

/** DELETE /api/favorites/:menuItemId */
favoritesRouter.delete("/:menuItemId", async (req, res, next) => {
  try {
    const parsed = idSchema.safeParse(req.params.menuItemId);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid menu item id" });
    }

    const [result] = await pool.execute(
      "DELETE FROM favorites WHERE user_id = ? AND menu_item_id = ?",
      [req.user.id, parsed.data],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    return res.json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    return next(error);
  }
});

export default favoritesRouter;
