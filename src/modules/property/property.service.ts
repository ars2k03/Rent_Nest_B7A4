import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../../utils/pagination.js";
import { sanitizeUser } from "../../utils/sanitizeUser.js";

type PropertyQuery = {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  amenities?: string;
  search?: string;
  isAvailable?: boolean;
  page?: string;
  limit?: string;
};

export const createPropertyService = async (
  landlordId: string,
  payload: Record<string, unknown>
) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId as string },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return prisma.property.create({
    data: {
      ...payload,
      landlordId,
    } as Parameters<typeof prisma.property.create>[0]["data"],
    include: {
      landlord: true,
      category: true,
    },
  });
};

export const getAllPropertiesService = async (query: PropertyQuery) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);

  const where: Record<string, unknown> = {};

  if (query.location) {
    where.location = { contains: query.location, mode: "insensitive" };
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { location: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.amenities) {
    where.amenities = { hasSome: query.amenities.split(",") };
  }

  if (query.isAvailable !== undefined) {
    where.isAvailable = query.isAvailable;
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        landlord: true,
        category: true,
        reviews: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties: properties.map((property) => ({
      ...property,
      landlord: sanitizeUser(property.landlord),
    })),
    meta: buildPaginationMeta(total, page, limit),
  };
};

export const getSinglePropertyService = async (id: string) => {
  const result = await prisma.property.findUnique({
    where: { id },
    include: {
      landlord: true,
      category: true,
      rentalRequests: true,
      reviews: {
        include: {
          tenant: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError("Property not found", 404);
  }

  return {
    ...result,
    landlord: sanitizeUser(result.landlord),
    reviews: result.reviews.map((review) => ({
      ...review,
      tenant: sanitizeUser(review.tenant),
    })),
  };
};

export const updatePropertyService = async (
  id: string,
  landlordId: string,
  payload: Record<string, unknown>
) => {
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.landlordId !== landlordId) {
    throw new AppError("You can only update your own properties", 403);
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId as string },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  const updated = await prisma.property.update({
    where: { id },
    data: payload as Parameters<typeof prisma.property.update>[0]["data"],
    include: {
      landlord: true,
      category: true,
    },
  });

  return {
    ...updated,
    landlord: sanitizeUser(updated.landlord),
  };
};

export const deletePropertyService = async (id: string, landlordId: string) => {
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.landlordId !== landlordId) {
    throw new AppError("You can only delete your own properties", 403);
  }

  await prisma.property.delete({ where: { id } });
};

export const getLandlordPropertiesService = async (
  landlordId: string,
  query: PropertyQuery
) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);

  const where = { landlordId };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        category: true,
        rentalRequests: true,
        reviews: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    meta: buildPaginationMeta(total, page, limit),
  };
};
