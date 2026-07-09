import type { Request, Response } from "express";
import {
  createUser,
  getCurrentUserService,
  loginUserService,
  updateProfileService,
} from "./auth.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await createUser(req.body);
  return sendSuccess(res, "User registered successfully", result, 201);
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUserService(req.body);
  return sendSuccess(res, "Login successful", result);
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await getCurrentUserService(req.user!.id);
  return sendSuccess(res, "Current user retrieved successfully", result);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await updateProfileService(req.user!.id, req.body);
  return sendSuccess(res, "Profile updated successfully", result);
});
