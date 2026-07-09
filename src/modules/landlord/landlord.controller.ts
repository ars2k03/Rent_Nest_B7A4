import type { Request, Response } from "express";
import {
  createPropertyService,
  deletePropertyService,
  getLandlordPropertiesService,
  updatePropertyService,
} from "../property/property.service.js";
import * as RentalService from "../rental/rental.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import {
  getAuthUser,
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "../../utils/request.js";
import type {
  CreatePropertyInput,
  PropertyIdParams,
  PropertyQueryInput,
  UpdatePropertyInput,
} from "../../validators/property.validator.js";
import type {
  RentalIdParams,
  RentalQueryInput,
  UpdateRentalStatusInput,
} from "../../validators/rental.validator.js";

export const createLandlordProperty = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const body = getValidatedBody<CreatePropertyInput>(req);
    const result = await createPropertyService(user.id, body);
    return sendSuccess(res, "Property created successfully", result, 201);
  }
);

export const updateLandlordProperty = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const { id } = getValidatedParams<PropertyIdParams>(req);
    const body = getValidatedBody<UpdatePropertyInput>(req);
    const result = await updatePropertyService(id, user.id, body);
    return sendSuccess(res, "Property updated successfully", result);
  }
);

export const deleteLandlordProperty = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const { id } = getValidatedParams<PropertyIdParams>(req);
    await deletePropertyService(id, user.id);
    return sendSuccess(res, "Property deleted successfully");
  }
);

export const getLandlordProperties = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const query = getValidatedQuery<PropertyQueryInput>(req);
    const result = await getLandlordPropertiesService(user.id, query);
    return sendSuccess(res, "Landlord properties retrieved successfully", result);
  }
);

export const getLandlordRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const query = getValidatedQuery<RentalQueryInput>(req);
    const result = await RentalService.getLandlordRentalRequestsService(user.id, query);
    return sendSuccess(res, "Landlord rental requests retrieved successfully", result);
  }
);

export const updateLandlordRequestStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const { id } = getValidatedParams<RentalIdParams>(req);
    const { status } = getValidatedBody<UpdateRentalStatusInput>(req);
    const result = await RentalService.updateLandlordRentalStatusService(
      id,
      user.id,
      status
    );
    return sendSuccess(res, "Rental request status updated successfully", result);
  }
);
