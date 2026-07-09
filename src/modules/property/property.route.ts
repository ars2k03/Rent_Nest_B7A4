import express from "express";
import {
  createProperty,
  getAllProperties,
  getSingleProperty,
} from "./property.controller.js";

const router = express.Router();

router.post("/", createProperty);
router.get("/", getAllProperties);
router.get("/:id", getSingleProperty);

export default router;