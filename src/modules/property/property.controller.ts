import type { Request, Response } from "express";
import {
  createPropertyService,
  getAllPropertiesService,
  getSinglePropertyService,
} from "./property.service";

export const createProperty = async (req: Request, res: Response) => {
  try {
    const result = await createPropertyService(req.body);

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const result = await getAllPropertiesService();

    res.status(200).json({
      success: true,
      message: "Properties retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await getSinglePropertyService(id as string);

    res.status(200).json({
      success: true,
      message: "Property retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};