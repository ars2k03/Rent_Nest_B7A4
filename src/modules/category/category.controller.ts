import type { Request, Response } from "express";
import * as CategoryService from "./category.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

export const getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
  const result = await CategoryService.getAllCategoriesService();
  return sendSuccess(res, "Categories retrieved successfully", result);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategoryService(req.body);
  return sendSuccess(res, "Category created successfully", result, 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await CategoryService.updateCategoryService(
    req.params.id as string,
    req.body
  );
  return sendSuccess(res, "Category updated successfully", result);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await CategoryService.deleteCategoryService(req.params.id as string);
  return sendSuccess(res, "Category deleted successfully");
});
