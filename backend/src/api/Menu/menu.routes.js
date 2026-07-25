import { Router } from "express";
import authenticate from "../../../middleware/authenticate.js";
import {
  uploadMenuImage,
  buildUploadUrl,
} from "../../../middleware/upload.js";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  rateMenuItem,
} from "./menu.controller.js";
import {
  validate,
  validateParams,
  createCategorySchema,
  updateCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  idParamSchema,
} from "./menu.validator.js";

const menuRouter = Router();
const adminAuth = authenticate(["admin"]);

function attachUploadedImage(req, _res, next) {
  if (req.file) {
    req.body.image_url = buildUploadUrl(req, req.file.filename);
  }
  if (req.body.image_url === "") {
    req.body.image_url = null;
  }
  next();
}

function handleMulterError(err, _req, res, next) {
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  return next();
}

// ─── Categories ──────────────────────────────────────────────────────────────

menuRouter.get("/categories", getCategories);
menuRouter.get("/categories/:id", validateParams(idParamSchema), getCategoryById);

menuRouter.post("/categories", adminAuth, validate(createCategorySchema), createCategory);
menuRouter.put(
  "/categories/:id",
  adminAuth,
  validateParams(idParamSchema),
  validate(updateCategorySchema),
  updateCategory,
);
menuRouter.delete("/categories/:id", adminAuth, validateParams(idParamSchema), deleteCategory);

// ─── Menu Items ──────────────────────────────────────────────────────────────

menuRouter.get("/menu-items", getMenuItems);
menuRouter.get("/menu-items/:id", validateParams(idParamSchema), getMenuItemById);

menuRouter.post(
  "/menu-items",
  adminAuth,
  (req, res, next) => {
    uploadMenuImage.single("image")(req, res, (err) => handleMulterError(err, req, res, next));
  },
  attachUploadedImage,
  validate(createMenuItemSchema),
  createMenuItem,
);

menuRouter.put(
  "/menu-items/:id",
  adminAuth,
  validateParams(idParamSchema),
  (req, res, next) => {
    uploadMenuImage.single("image")(req, res, (err) => handleMulterError(err, req, res, next));
  },
  attachUploadedImage,
  validate(updateMenuItemSchema),
  updateMenuItem,
);

menuRouter.delete(
  "/menu-items/:id",
  adminAuth,
  validateParams(idParamSchema),
  deleteMenuItem,
);

import jwt from "jsonwebtoken";

function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.split(" ")[1];
  if (!token || token === "null" || token === "undefined") {
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch {
    // Ignore invalid token for optional auth
  }
  return next();
}

menuRouter.post("/menu-items/:id/rate", optionalAuth, rateMenuItem);

export default menuRouter;
