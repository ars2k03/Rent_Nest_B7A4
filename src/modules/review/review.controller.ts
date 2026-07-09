import type { Request, Response } from "express";
import * as ReviewService from "./review.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const result = await ReviewService.createReviewService(req.user!.id, req.body);
  return sendSuccess(res, "Review created successfully", result, 201);
});
