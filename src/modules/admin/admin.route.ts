import express from "express";
import {
  getAllProperties,
  getAllRentals,
  getAllUsers,
  updateUserStatus,
} from "./admin.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  adminQuerySchema,
  updateUserStatusSchema,
  userIdSchema,
} from "../../validators/admin.validator.js";

const router = express.Router();

router.use(authenticate(), authorize("ADMIN"));

router.get("/users", validate(adminQuerySchema, "query"), getAllUsers);
router.patch(
  "/users/:id",
  validate(userIdSchema, "params"),
  validate(updateUserStatusSchema),
  updateUserStatus
);
router.get("/properties", validate(adminQuerySchema, "query"), getAllProperties);
router.get("/rentals", validate(adminQuerySchema, "query"), getAllRentals);

export default router;
