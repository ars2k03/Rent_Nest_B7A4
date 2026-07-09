import type { CreateCategoryInput, UpdateCategoryInput } from "../../validators/category.validator.js";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

export const getAllCategoriesService = async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

export const createCategoryService = async (payload: CreateCategoryInput) => {
  const existing = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (existing) {
    throw new AppError("Category already exists", 409);
  }

  return prisma.category.create({
    data: {
      name: payload.name,
      ...(payload.description ? { description: payload.description } : {}),
    },
  });
};

export const updateCategoryService = async (
  id: string,
  payload: UpdateCategoryInput
) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.description !== undefined
        ? { description: payload.description }
        : {}),
    },
  });
};

export const deleteCategoryService = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const propertyCount = await prisma.property.count({ where: { categoryId: id } });

  if (propertyCount > 0) {
    throw new AppError("Cannot delete category with existing properties", 400);
  }

  await prisma.category.delete({ where: { id } });
};
