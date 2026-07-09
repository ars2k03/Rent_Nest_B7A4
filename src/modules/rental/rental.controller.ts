import type { Request, Response } from "express";
import * as RentalService from "./rental.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import {
  getAuthUser,
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "../../utils/request.js";
import type {
  CreateRentalInput,
  RentalIdParams,
  RentalQueryInput,
} from "../../validators/rental.validator.js";

export const createRental = asyncHandler(async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const body = getValidatedBody<CreateRentalInput>(req);
  const result = await RentalService.createRentalService(user.id, body);
  return sendSuccess(res, "Rental request submitted successfully", result, 201);
});

export const getMyRentals = asyncHandler(async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const query = getValidatedQuery<RentalQueryInput>(req);
  const result = await RentalService.getTenantRentalsService(user.id, query);
  return sendSuccess(res, "Rental requests retrieved successfully", result);
});

export const getSingleRental = asyncHandler(async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { id } = getValidatedParams<RentalIdParams>(req);
  const result = await RentalService.getSingleRentalService(id, user.id, user.role);
  return sendSuccess(res, "Rental request retrieved successfully", result);
});
