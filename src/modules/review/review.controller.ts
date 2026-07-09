import type { Request, Response } from "express";
import * as ReviewService from "./review.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { getAuthUser, getValidatedBody } from "../../utils/request.js";
import type { CreateReviewInput } from "../../validators/review.validator.js";

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const body = getValidatedBody<CreateReviewInput>(req);
  const result = await ReviewService.createReviewService(user.id, body);
  return sendSuccess(res, "Review created successfully", result, 201);
});
