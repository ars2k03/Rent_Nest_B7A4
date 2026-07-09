import express from "express";
import { createRental, getMyRentals, getSingleRental } from "./rental.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createRentalSchema,
  rentalIdSchema,
  rentalQuerySchema,
} from "../../validators/rental.validator.js";

const router = express.Router();

router.use(authenticate(), authorize("TENANT"));

router.post("/", validate(createRentalSchema), createRental);
router.get("/", validate(rentalQuerySchema, "query"), getMyRentals);
router.get("/:id", validate(rentalIdSchema, "params"), getSingleRental);

export default router;
