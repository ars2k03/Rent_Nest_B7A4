import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "./category.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../../validators/category.validator.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post(
  "/",
  authenticate(),
  authorize("ADMIN"),
  validate(createCategorySchema),
  createCategory
);
router.patch(
  "/:id",
  authenticate(),
  authorize("ADMIN"),
  validate(categoryIdSchema, "params"),
  validate(updateCategorySchema),
  updateCategory
);
router.delete(
  "/:id",
  authenticate(),
  authorize("ADMIN"),
  validate(categoryIdSchema, "params"),
  deleteCategory
);

export default router;
