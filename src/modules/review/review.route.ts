import express from "express";
import { createReview } from "./review.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createReviewSchema } from "../../validators/review.validator.js";

const router = express.Router();

router.post(
  "/",
  authenticate(),
  authorize("TENANT"),
  validate(createReviewSchema),
  createReview
);

export default router;
