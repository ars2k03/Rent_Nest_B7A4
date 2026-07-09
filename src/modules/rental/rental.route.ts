import express from "express";
import { createRental, getMyRentals, getSingleRental, updateRentalStatus } from "./rental.controller.js";

const router = express.Router();

router.post("/", createRental);

router.get("/", getMyRentals);

router.get("/:id", getSingleRental);

router.patch("/:id", updateRentalStatus);

export default router;