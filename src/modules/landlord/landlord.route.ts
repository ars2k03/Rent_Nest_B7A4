import express from "express";
import {
  createLandlordProperty,
  deleteLandlordProperty,
  getLandlordProperties,
  getLandlordRequests,
  updateLandlordProperty,
  updateLandlordRequestStatus,
} from "./landlord.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createPropertySchema,
  propertyIdSchema,
  propertyQuerySchema,
  updatePropertySchema,
} from "../../validators/property.validator.js";
import {
  rentalIdSchema,
  rentalQuerySchema,
  updateRentalStatusSchema,
} from "../../validators/rental.validator.js";

const router = express.Router();

router.use(authenticate(), authorize("LANDLORD"));

router.get(
  "/properties",
  validate(propertyQuerySchema, "query"),
  getLandlordProperties
);
router.post("/properties", validate(createPropertySchema), createLandlordProperty);
router.put(
  "/properties/:id",
  validate(propertyIdSchema, "params"),
  validate(updatePropertySchema),
  updateLandlordProperty
);
router.delete(
  "/properties/:id",
  validate(propertyIdSchema, "params"),
  deleteLandlordProperty
);
router.get(
  "/requests",
  validate(rentalQuerySchema, "query"),
  getLandlordRequests
);
router.patch(
  "/requests/:id",
  validate(rentalIdSchema, "params"),
  validate(updateRentalStatusSchema),
  updateLandlordRequestStatus
);

export default router;
