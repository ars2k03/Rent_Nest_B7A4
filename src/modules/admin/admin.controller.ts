import type { Request, Response } from "express";
import * as AdminService from "./admin.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "../../utils/request.js";
import type {
  AdminQueryInput,
  UpdateUserStatusInput,
  UserIdParams,
} from "../../validators/admin.validator.js";

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<AdminQueryInput>(req);
  const result = await AdminService.getAllUsersService(query);
  return sendSuccess(res, "Users retrieved successfully", result);
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = getValidatedParams<UserIdParams>(req);
  const { isDeleted } = getValidatedBody<UpdateUserStatusInput>(req);
  const result = await AdminService.updateUserStatusService(id, isDeleted);
  return sendSuccess(res, "User status updated successfully", result);
});

export const getAllProperties = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<AdminQueryInput>(req);
  const result = await AdminService.getAllAdminPropertiesService(query);
  return sendSuccess(res, "Properties retrieved successfully", result);
});

export const getAllRentals = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<AdminQueryInput>(req);
  const result = await AdminService.getAllAdminRentalsService(query);
  return sendSuccess(res, "Rental requests retrieved successfully", result);
});
