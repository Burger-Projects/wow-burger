import pool from "../../../database.js";

// ─── Categories ──────────────────────────────────────────────────────────────

/**
 * GET /categories
 * Returns all categories ordered by name.
 */
export async function getCategories(req, res, next) {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, slug, created_at FROM categories ORDER BY name ASC",
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /categories/:id
 * Returns a single category by ID, including its menu items.
 */
export async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;

    const [categories] = await pool.execute(
      "SELECT id, name, slug, created_at FROM categories WHERE id = ?",
      [id],
    );

    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const [items] = await pool.execute(
      `SELECT id, category_id, name, description, price, image_url, is_available, created_at, updated_at
       FROM menu_items
       WHERE category_id = ?
       ORDER BY name ASC`,
      [id],
    );

    return res.json({
      success: true,
      data: { ...categories[0], items },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /categories
 * Creates a new category.
 */
export async function createCategory(req, res, next) {
  try {
    const { name, slug } = req.body;

    const [result] = await pool.execute(
      "INSERT INTO categories (name, slug) VALUES (?, ?)",
      [name, slug],
    );

    const [created] = await pool.execute(
      "SELECT id, name, slug, created_at FROM categories WHERE id = ?",
      [result.insertId],
    );

    return res.status(201).json({ success: true, data: created[0] });
  } catch (error) {
    // Handle duplicate slug
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "A category with this slug already exists" });
    }
    return next(error);
  }
}

/**
 * PUT /categories/:id
 * Updates an existing category.
 */
export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    // Build dynamic SET clause for partial updates
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name);
    }
    if (slug !== undefined) {
      fields.push("slug = ?");
      values.push(slug);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(id);
    const [result] = await pool.execute(
      `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const [updated] = await pool.execute(
      "SELECT id, name, slug, created_at FROM categories WHERE id = ?",
      [id],
    );

    return res.json({ success: true, data: updated[0] });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "A category with this slug already exists" });
    }
    return next(error);
  }
}

/**
 * DELETE /categories/:id
 * Deletes a category and all its menu items (CASCADE).
 */
export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM categories WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    return next(error);
  }
}

// ─── Menu Items ──────────────────────────────────────────────────────────────

/**
 * GET /menu-items
 * Returns all menu items, optionally filtered by category_id and availability.
 * Query params: ?category_id=uuid&is_available=true
 */
export async function getMenuItems(req, res, next) {
  try {
    let sql = `
      SELECT mi.id, mi.category_id, mi.name, mi.description, mi.price,
             mi.image_url, mi.is_available, mi.created_at, mi.updated_at,
             c.name AS category_name, c.slug AS category_slug,
             COALESCE(ROUND(AVG(mir.rating), 1), 0) AS avg_rating,
             COUNT(mir.id) AS rating_count
      FROM menu_items mi
      LEFT JOIN categories c ON c.id = mi.category_id
      LEFT JOIN menu_item_ratings mir ON mir.menu_item_id = mi.id
      WHERE 1=1
    `;
    const values = [];

    if (req.query.category_id) {
      sql += " AND mi.category_id = ?";
      values.push(req.query.category_id);
    }

    if (req.query.is_available !== undefined) {
      const isAvailable = req.query.is_available === "true" ? 1 : 0;
      sql += " AND mi.is_available = ?";
      values.push(isAvailable);
    }

    sql += " GROUP BY mi.id ORDER BY c.name ASC, mi.name ASC";

    const [rows] = await pool.execute(sql, values);
    return res.json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /menu-items/:id
 * Returns a single menu item by ID.
 */
export async function getMenuItemById(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT mi.id, mi.category_id, mi.name, mi.description, mi.price,
              mi.image_url, mi.is_available, mi.created_at, mi.updated_at,
              c.name AS category_name, c.slug AS category_slug
       FROM menu_items mi
       LEFT JOIN categories c ON c.id = mi.category_id
       WHERE mi.id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /menu-items
 * Creates a new menu item.
 */
export async function createMenuItem(req, res, next) {
  try {
    const { category_id, name, description, price, image_url, is_available } = req.body;

    // Verify category exists
    const [category] = await pool.execute("SELECT id FROM categories WHERE id = ?", [category_id]);
    if (category.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const [result] = await pool.execute(
      `INSERT INTO menu_items (category_id, name, description, price, image_url, is_available)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category_id, name, description, price, image_url ?? null, is_available ?? true],
    );

    const [created] = await pool.execute(
      `SELECT mi.id, mi.category_id, mi.name, mi.description, mi.price,
              mi.image_url, mi.is_available, mi.created_at, mi.updated_at,
              c.name AS category_name, c.slug AS category_slug
       FROM menu_items mi
       LEFT JOIN categories c ON c.id = mi.category_id
       WHERE mi.id = ?`,
      [result.insertId],
    );

    return res.status(201).json({ success: true, data: created[0] });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /menu-items/:id
 * Updates an existing menu item.
 */
export async function updateMenuItem(req, res, next) {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, image_url, is_available } = req.body;

    // Build dynamic SET clause
    const fields = [];
    const values = [];

    if (category_id !== undefined) {
      // Verify category exists
      const [category] = await pool.execute("SELECT id FROM categories WHERE id = ?", [category_id]);
      if (category.length === 0) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }
      fields.push("category_id = ?");
      values.push(category_id);
    }
    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name);
    }
    if (description !== undefined) {
      fields.push("description = ?");
      values.push(description);
    }
    if (price !== undefined) {
      fields.push("price = ?");
      values.push(price);
    }
    if (image_url !== undefined) {
      fields.push("image_url = ?");
      values.push(image_url);
    }
    if (is_available !== undefined) {
      fields.push("is_available = ?");
      values.push(is_available);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    // Always update the updated_at timestamp
    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE menu_items SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    const [updated] = await pool.execute(
      `SELECT mi.id, mi.category_id, mi.name, mi.description, mi.price,
              mi.image_url, mi.is_available, mi.created_at, mi.updated_at,
              c.name AS category_name, c.slug AS category_slug
       FROM menu_items mi
       LEFT JOIN categories c ON c.id = mi.category_id
       WHERE mi.id = ?`,
      [id],
    );

    return res.json({ success: true, data: updated[0] });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /menu-items/:id
 * Deletes a menu item.
 */
export async function deleteMenuItem(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM menu_items WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    return res.json({ success: true, message: "Menu item deleted successfully" });
  } catch (error) {
    return next(error);
  }
}


export async function rateMenuItem(req, res, next) {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // Verify item exists
    const [items] = await pool.execute("SELECT id FROM menu_items WHERE id = ?", [id]);
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    await pool.execute(
      "INSERT INTO menu_item_ratings (menu_item_id, rating) VALUES (?, ?)",
      [id, numericRating],
    );

    // Calculate new average and rating count
    const [stats] = await pool.execute(
      `SELECT COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating,
              COUNT(id) AS rating_count
       FROM menu_item_ratings
       WHERE menu_item_id = ?`,
      [id],
    );

    return res.json({
      success: true,
      message: "Thank you for rating!",
      data: stats[0],
    });
  } catch (error) {
    return next(error);
  }
}