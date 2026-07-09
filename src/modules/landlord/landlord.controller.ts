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

export const createLandlordProperty = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await createPropertyService(req.user!.id, req.body);
    return sendSuccess(res, "Property created successfully", result, 201);
  }
);

export const updateLandlordProperty = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await updatePropertyService(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    return sendSuccess(res, "Property updated successfully", result);
  }
);

export const deleteLandlordProperty = asyncHandler(
  async (req: Request, res: Response) => {
    await deletePropertyService(req.params.id as string, req.user!.id);
    return sendSuccess(res, "Property deleted successfully");
  }
);

export const getLandlordProperties = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getLandlordPropertiesService(req.user!.id, req.query);
    return sendSuccess(res, "Landlord properties retrieved successfully", result);
  }
);

export const getLandlordRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await RentalService.getLandlordRentalRequestsService(
      req.user!.id,
      req.query
    );
    return sendSuccess(res, "Landlord rental requests retrieved successfully", result);
  }
);

export const updateLandlordRequestStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await RentalService.updateLandlordRentalStatusService(
      req.params.id as string,
      req.user!.id,
      req.body.status
    );
    return sendSuccess(res, "Rental request status updated successfully", result);
  }
);
