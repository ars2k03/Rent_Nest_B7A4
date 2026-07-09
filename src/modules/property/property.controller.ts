import type { Request, Response } from "express";
import {
  getAllPropertiesService,
  getSinglePropertyService,
} from "./property.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

export const getAllProperties = asyncHandler(async (req: Request, res: Response) => {
  const result = await getAllPropertiesService(req.query);
  return sendSuccess(res, "Properties retrieved successfully", result);
});

export const getSingleProperty = asyncHandler(async (req: Request, res: Response) => {
  const result = await getSinglePropertyService(req.params.id as string);
  return sendSuccess(res, "Property retrieved successfully", result);
});
