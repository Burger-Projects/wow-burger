import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../../../database.js";
import loginLimiter from "../../../middleware/rateLimiter.js";

dotenv.config();

const userRouter = Router();

userRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const [users] = await pool.execute(
      "SELECT id, full_name, email, password, role, company_id, branch_id FROM users WHERE email = ? LIMIT 1",
      [email.trim().toLowerCase()],
    );

    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        company_id: user.company_id,
        branch_id: user.branch_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    return res.json({ success: true, data: { token } });
  } catch (error) {
    return next(error);
  }
});

export default userRouter;
