import type { Request, Response } from "express";
import {
  createUser,
  getCurrentUserService,
  loginUserService,
  updateProfileService,
} from "./auth.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import {
  getAuthUser,
  getValidatedBody,
} from "../../utils/request.js";
import type {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "../../validators/auth.validator.js";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const body = getValidatedBody<RegisterInput>(req);
  const result = await createUser(body);
  return sendSuccess(res, "User registered successfully", result, 201);
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const body = getValidatedBody<LoginInput>(req);
  const result = await loginUserService(body);
  return sendSuccess(res, "Login successful", result);
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const result = await getCurrentUserService(user.id);
  return sendSuccess(res, "Current user retrieved successfully", result);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const body = getValidatedBody<UpdateProfileInput>(req);
  const result = await updateProfileService(user.id, body);
  return sendSuccess(res, "Profile updated successfully", result);
});
