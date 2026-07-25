import { Router } from "express";
import pool from "../../../database.js";
import authenticate from "../../../middleware/authenticate.js";

const branchesRouter = Router();

const BRANCH_FIELDS = `
  id, name, address, city, phone, email, hours,
  latitude, longitude, is_primary, is_active, sort_order,
  created_at, updated_at
`;

function normalizeBranch(row) {
  if (!row) return null;
  return {
    ...row,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    is_primary: Boolean(row.is_primary),
    is_active: Boolean(row.is_active),
  };
}

function parseBranchBody(body) {
  const name = String(body.name || "").trim();
  const address = String(body.address || "").trim();
  const city = body.city ? String(body.city).trim() : null;
  const phone = body.phone ? String(body.phone).trim() : null;
  const email = body.email ? String(body.email).trim().toLowerCase() : null;
  const hours = body.hours ? String(body.hours).trim() : null;
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const is_primary = body.is_primary === true || body.is_primary === 1 || body.is_primary === "1" || body.is_primary === "true";
  const is_active = body.is_active === undefined
    ? true
    : body.is_active === true || body.is_active === 1 || body.is_active === "1" || body.is_active === "true";
  const sort_order = body.sort_order !== undefined && body.sort_order !== ""
    ? Number(body.sort_order)
    : 0;

  return {
    name,
    address,
    city,
    phone,
    email,
    hours,
    latitude,
    longitude,
    is_primary,
    is_active,
    sort_order,
  };
}

function validateBranch(data) {
  if (!data.name) return "Branch name is required";
  if (!data.address) return "Address is required";
  if (Number.isNaN(data.latitude) || data.latitude < -90 || data.latitude > 90) {
    return "Valid latitude is required (-90 to 90)";
  }
  if (Number.isNaN(data.longitude) || data.longitude < -180 || data.longitude > 180) {
    return "Valid longitude is required (-180 to 180)";
  }
  if (Number.isNaN(data.sort_order)) return "Sort order must be a number";
  return null;
}

async function clearOtherPrimaries(connection, exceptId = null) {
  if (exceptId) {
    await connection.execute(
      "UPDATE branches SET is_primary = 0 WHERE id <> ?",
      [exceptId],
    );
  } else {
    await connection.execute("UPDATE branches SET is_primary = 0");
  }
}

// Public: active branches only (for contact map)
branchesRouter.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ${BRANCH_FIELDS}
       FROM branches
       WHERE is_active = 1
       ORDER BY is_primary DESC, sort_order ASC, name ASC`,
    );
    return res.json({
      success: true,
      data: rows.map(normalizeBranch),
    });
  } catch (error) {
    return next(error);
  }
});

// Admin: all branches
branchesRouter.get("/admin", authenticate(["admin"]), async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ${BRANCH_FIELDS}
       FROM branches
       ORDER BY is_primary DESC, sort_order ASC, name ASC`,
    );
    return res.json({
      success: true,
      data: rows.map(normalizeBranch),
    });
  } catch (error) {
    return next(error);
  }
});

// Admin: create branch
branchesRouter.post("/", authenticate(["admin"]), async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const data = parseBranchBody(req.body);
    const error = validateBranch(data);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    await connection.beginTransaction();

    if (data.is_primary) {
      await clearOtherPrimaries(connection);
    }

    const [result] = await connection.execute(
      `INSERT INTO branches
        (name, address, city, phone, email, hours, latitude, longitude, is_primary, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.address,
        data.city,
        data.phone,
        data.email,
        data.hours,
        data.latitude,
        data.longitude,
        data.is_primary ? 1 : 0,
        data.is_active ? 1 : 0,
        data.sort_order,
      ],
    );

    await connection.commit();

    const [rows] = await pool.execute(
      `SELECT ${BRANCH_FIELDS} FROM branches WHERE id = ? LIMIT 1`,
      [result.insertId],
    );

    return res.status(201).json({
      success: true,
      message: "Branch created",
      data: normalizeBranch(rows[0]),
    });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
});

// Admin: update branch
branchesRouter.put("/:id", authenticate(["admin"]), async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const data = parseBranchBody(req.body);
    const error = validateBranch(data);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const [existing] = await connection.execute(
      "SELECT id FROM branches WHERE id = ? LIMIT 1",
      [id],
    );
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    await connection.beginTransaction();

    if (data.is_primary) {
      await clearOtherPrimaries(connection, id);
    }

    await connection.execute(
      `UPDATE branches SET
        name = ?, address = ?, city = ?, phone = ?, email = ?, hours = ?,
        latitude = ?, longitude = ?, is_primary = ?, is_active = ?, sort_order = ?
       WHERE id = ?`,
      [
        data.name,
        data.address,
        data.city,
        data.phone,
        data.email,
        data.hours,
        data.latitude,
        data.longitude,
        data.is_primary ? 1 : 0,
        data.is_active ? 1 : 0,
        data.sort_order,
        id,
      ],
    );

    await connection.commit();

    const [rows] = await pool.execute(
      `SELECT ${BRANCH_FIELDS} FROM branches WHERE id = ? LIMIT 1`,
      [id],
    );

    return res.json({
      success: true,
      message: "Branch updated",
      data: normalizeBranch(rows[0]),
    });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
});

// Admin: delete branch
branchesRouter.delete("/:id", authenticate(["admin"]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM branches WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }
    return res.json({ success: true, message: "Branch deleted" });
  } catch (error) {
    return next(error);
  }
});

export default branchesRouter;
