import { z } from "zod";

const idField = z.coerce.number().int().positive("ID must be a positive number");

const imageUrlField = z
  .union([z.string().max(500), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" || v === undefined ? null : v));

// ─── Category Schemas ────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: "Category name is required" })
    .min(1, "Category name cannot be empty")
    .max(50, "Category name must be 50 characters or less"),
  slug: z
    .string({ required_error: "Category slug is required" })
    .min(1, "Slug cannot be empty")
    .max(50, "Slug must be 50 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens only"),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name cannot be empty")
    .max(50, "Category name must be 50 characters or less")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug cannot be empty")
    .max(50, "Slug must be 50 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens only")
    .optional(),
});

// ─── Menu Item Schemas ───────────────────────────────────────────────────────

function coerceBoolean(value) {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  return value;
}

export const createMenuItemSchema = z.object({
  category_id: idField,
  name: z
    .string({ required_error: "Item name is required" })
    .min(1, "Item name cannot be empty")
    .max(100, "Item name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .default(""),
  price: z.coerce
    .number({ required_error: "Price is required", invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0")
    .max(999999.99, "Price is too high"),
  image_url: imageUrlField.default(null),
  is_available: z.preprocess(coerceBoolean, z.boolean()).optional().default(true),
});

export const updateMenuItemSchema = z.object({
  category_id: idField.optional(),
  name: z
    .string()
    .min(1, "Item name cannot be empty")
    .max(100, "Item name must be 100 characters or less")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0")
    .max(999999.99, "Price is too high")
    .optional(),
  image_url: imageUrlField,
  is_available: z.preprocess(coerceBoolean, z.boolean()).optional(),
});

export const idParamSchema = z.object({
  id: idField,
});

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ error: "Validation failed", details: errors });
    }
    req.body = result.data;
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ error: "Invalid parameters", details: errors });
    }
    req.params = result.data;
    next();
  };
}
