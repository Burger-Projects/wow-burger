import { Router } from "express";
import pool from "../../../database.js";
import authenticate from "../../../middleware/authenticate.js";

const reviewsRouter = Router();

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// 1. Submit a new customer review (defaults to is_approved = 0)
reviewsRouter.post("/", async (req, res, next) => {
  try {
    const { customer_name, email, rating, comment, created_at } = req.body;

    if (!customer_name || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Name, rating, and feedback message are required",
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const reviewDate = created_at ? new Date(created_at) : new Date();
    if (created_at && Number.isNaN(reviewDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid review date" });
    }
    const [result] = await pool.execute(
      "INSERT INTO reviews (customer_name, email, rating, comment, is_approved, created_at) VALUES (?, ?, ?, ?, 0, ?)",
      [
        customer_name.trim(),
        email ? email.trim().toLowerCase() : null,
        numericRating,
        comment.trim(),
        reviewDate,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Thank you for your feedback! It will be displayed once approved.",
      data: { id: result.insertId },
    });
  } catch (error) {
    return next(error);
  }
});

// 2. Fetch all approved reviews (Public site display)
reviewsRouter.get("/", async (req, res, next) => {
  try {
    const [reviews] = await pool.execute(
      "SELECT id, customer_name, rating, comment, created_at FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC",
    );

    return res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return next(error);
  }
});

// ==========================================
// ADMIN ENDPOINTS (Requires 'admin' role)
// ==========================================

// 3. Fetch ALL reviews for admin panel (both approved & pending)
reviewsRouter.get("/admin", authenticate(["admin"]), async (req, res, next) => {
  try {
    const [reviews] = await pool.execute(
      "SELECT id, customer_name, email, rating, comment, is_approved, created_at FROM reviews ORDER BY created_at DESC",
    );

    return res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return next(error);
  }
});

// 4. Toggle approval status of a review
reviewsRouter.patch("/:id/toggle", authenticate(["admin"]), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if review exists
    const [existing] = await pool.execute("SELECT id, is_approved FROM reviews WHERE id = ? LIMIT 1", [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const newStatus = existing[0].is_approved ? 0 : 1;

    await pool.execute("UPDATE reviews SET is_approved = ? WHERE id = ?", [newStatus, id]);

    return res.json({
      success: true,
      message: `Review ${newStatus ? "approved and visible" : "hidden from website"}`,
      data: { id: Number(id), is_approved: newStatus },
    });
  } catch (error) {
    return next(error);
  }
});

// 5. Delete a review
reviewsRouter.delete("/:id", authenticate(["admin"]), async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM reviews WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    return res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    return next(error);
  }
});

export default reviewsRouter;
