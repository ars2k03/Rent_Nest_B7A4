import express from "express";
import { getAllProperties, getSingleProperty } from "./property.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  propertyIdSchema,
  propertyQuerySchema,
} from "../../validators/property.validator.js";

const router = express.Router();

router.get("/", validate(propertyQuerySchema, "query"), getAllProperties);
router.get("/:id", validate(propertyIdSchema, "params"), getSingleProperty);

export default router;
