import type { Request, Response } from "express";
import * as AdminService from "./admin.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsersService(req.query);
  return sendSuccess(res, "Users retrieved successfully", result);
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.updateUserStatusService(
    req.params.id as string,
    req.body.isDeleted
  );
  return sendSuccess(res, "User status updated successfully", result);
});

export const getAllProperties = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getAllAdminPropertiesService(req.query);
  return sendSuccess(res, "Properties retrieved successfully", result);
});

export const getAllRentals = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getAllAdminRentalsService(req.query);
  return sendSuccess(res, "Rental requests retrieved successfully", result);
});
