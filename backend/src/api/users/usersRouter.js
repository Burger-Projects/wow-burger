import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { z } from "zod";
import pool from "../../../database.js";
import loginLimiter from "../../../middleware/rateLimiter.js";
import authenticate from "../../../middleware/authenticate.js";

dotenv.config();

const userRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

/** POST /api/users/register — customers only */
userRouter.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, 'customer')`,
      [name.trim(), normalizedEmail, passwordHash],
    );

    const [rows] = await pool.execute(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [result.insertId],
    );

    const user = rows[0];
    const token = signToken(user);

    return res.status(201).json({
      success: true,
      data: { token, user: publicUser(user) },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }
    return next(error);
  }
});

/** POST /api/users/login */
userRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const { password } = parsed.data;

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const [users] = await pool.execute(
      "SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      data: { token, user: publicUser(user) },
    });
  } catch (error) {
    return next(error);
  }
});

/** GET /api/users/me */
userRouter.get("/me", authenticate(), async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1",
      [req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, data: publicUser(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

/** GET /api/users — admin: list users */
userRouter.get("/", authenticate(["admin"]), async (req, res, next) => {
  try {
    const role = req.query.role;
    let sql =
      "SELECT id, name, email, role, created_at FROM users WHERE 1=1";
    const values = [];

    if (role === "admin" || role === "customer") {
      sql += " AND role = ?";
      values.push(role);
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.execute(sql, values);
    return res.json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
});

/** POST /api/users — admin: create admin or customer */
userRouter.post("/", authenticate(["admin"]), async (req, res, next) => {
  try {
    const schema = registerSchema.extend({
      role: z.enum(["admin", "customer"]).default("customer"),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: parsed.error.issues,
      });
    }

    const { name, email, password, role } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [name.trim(), email.trim().toLowerCase(), passwordHash, role],
    );

    const [rows] = await pool.execute(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [result.insertId],
    );

    return res.status(201).json({ success: true, data: publicUser(rows[0]) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }
    return next(error);
  }
});

/** PATCH /api/users/:id/role — admin: change role */
userRouter.patch(
  "/:id/role",
  authenticate(["admin"]),
  async (req, res, next) => {
    try {
      const userId = Number(req.params.id);
      const role = req.body?.role;

      if (!Number.isInteger(userId) || userId < 1) {
        return res.status(400).json({ success: false, message: "Invalid user id" });
      }
      if (role !== "admin" && role !== "customer") {
        return res.status(400).json({
          success: false,
          message: "Role must be admin or customer",
        });
      }
      if (userId === req.user.id && role !== "admin") {
        return res.status(400).json({
          success: false,
          message: "You cannot remove your own admin role",
        });
      }

      const [result] = await pool.execute(
        "UPDATE users SET role = ? WHERE id = ?",
        [role, userId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const [rows] = await pool.execute(
        "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
        [userId],
      );

      return res.json({ success: true, data: publicUser(rows[0]) });
    } catch (error) {
      return next(error);
    }
  },
);

/** DELETE /api/users/:id — admin */
userRouter.delete("/:id", authenticate(["admin"]), async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "User deleted" });
  } catch (error) {
    return next(error);
  }
});

export default userRouter;
