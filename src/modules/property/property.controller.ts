import type { Request, Response } from "express";
import {
  getAllPropertiesService,
  getSinglePropertyService,
} from "./property.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import {
  getValidatedParams,
  getValidatedQuery,
} from "../../utils/request.js";
import type {
  PropertyIdParams,
  PropertyQueryInput,
} from "../../validators/property.validator.js";

export const getAllProperties = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<PropertyQueryInput>(req);
  const result = await getAllPropertiesService(query);
  return sendSuccess(res, "Properties retrieved successfully", result);
});

export const getSingleProperty = asyncHandler(async (req: Request, res: Response) => {
  const { id } = getValidatedParams<PropertyIdParams>(req);
  const result = await getSinglePropertyService(id);
  return sendSuccess(res, "Property retrieved successfully", result);
});
