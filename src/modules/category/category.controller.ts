import type { Request, Response } from "express";
import * as CategoryService from "./category.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import {
  getValidatedBody,
  getValidatedParams,
} from "../../utils/request.js";
import type {
  CategoryIdParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../validators/category.validator.js";

export const getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
  const result = await CategoryService.getAllCategoriesService();
  return sendSuccess(res, "Categories retrieved successfully", result);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const body = getValidatedBody<CreateCategoryInput>(req);
  const result = await CategoryService.createCategoryService(body);
  return sendSuccess(res, "Category created successfully", result, 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = getValidatedParams<CategoryIdParams>(req);
  const body = getValidatedBody<UpdateCategoryInput>(req);
  const result = await CategoryService.updateCategoryService(id, body);
  return sendSuccess(res, "Category updated successfully", result);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = getValidatedParams<CategoryIdParams>(req);
  await CategoryService.deleteCategoryService(id);
  return sendSuccess(res, "Category deleted successfully");
});
