import type { Request, Response } from "express";
import * as RentalService from "./rental.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

export const createRental = asyncHandler(async (req: Request, res: Response) => {
  const result = await RentalService.createRentalService(req.user!.id, req.body);
  return sendSuccess(res, "Rental request submitted successfully", result, 201);
});

export const getMyRentals = asyncHandler(async (req: Request, res: Response) => {
  const result = await RentalService.getTenantRentalsService(req.user!.id, req.query);
  return sendSuccess(res, "Rental requests retrieved successfully", result);
});

export const getSingleRental = asyncHandler(async (req: Request, res: Response) => {
  const result = await RentalService.getSingleRentalService(
    req.params.id as string,
    req.user!.id,
    req.user!.role
  );
  return sendSuccess(res, "Rental request retrieved successfully", result);
});
