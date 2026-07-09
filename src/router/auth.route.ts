import express from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  updateProfile,
} from "../modules/auth/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.get("/me", authenticate(), getCurrentUser);
router.patch("/me", authenticate(), validate(updateProfileSchema), updateProfile);

export default router;
