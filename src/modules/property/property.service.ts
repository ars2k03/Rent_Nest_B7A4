import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../../utils/pagination.js";
import { sanitizeUser } from "../../utils/sanitizeUser.js";
import type {
  CreatePropertyInput,
  PropertyQueryInput,
  UpdatePropertyInput,
} from "../../validators/property.validator.js";
import type { Prisma } from "@prisma/client";

const buildPropertyCreateData = (
  payload: CreatePropertyInput,
  landlordId: string
): Prisma.PropertyCreateInput => ({
  title: payload.title,
  description: payload.description,
  location: payload.location,
  price: payload.price,
  bedrooms: payload.bedrooms,
  bathrooms: payload.bathrooms,
  amenities: payload.amenities,
  landlord: { connect: { id: landlordId } },
  category: { connect: { id: payload.categoryId } },
  ...(payload.image ? { image: payload.image } : {}),
  ...(payload.isAvailable !== undefined ? { isAvailable: payload.isAvailable } : {}),
});

const buildPropertyUpdateData = (
  payload: UpdatePropertyInput
): Prisma.PropertyUpdateInput => {
  const data: Prisma.PropertyUpdateInput = {};

  if (payload.title !== undefined) data.title = payload.title;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.location !== undefined) data.location = payload.location;
  if (payload.price !== undefined) data.price = payload.price;
  if (payload.bedrooms !== undefined) data.bedrooms = payload.bedrooms;
  if (payload.bathrooms !== undefined) data.bathrooms = payload.bathrooms;
  if (payload.image !== undefined) data.image = payload.image;
  if (payload.amenities !== undefined) data.amenities = payload.amenities;
  if (payload.isAvailable !== undefined) data.isAvailable = payload.isAvailable;
  if (payload.categoryId !== undefined) {
    data.category = { connect: { id: payload.categoryId } };
  }

  return data;
};

const buildPropertyWhere = (query: PropertyQueryInput): Prisma.PropertyWhereInput => {
  const where: Prisma.PropertyWhereInput = {};

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

  return where;
};

export const createPropertyService = async (
  landlordId: string,
  payload: CreatePropertyInput
) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return prisma.property.create({
    data: buildPropertyCreateData(payload, landlordId),
    include: {
      landlord: true,
      category: true,
    },
  });
};

export const getAllPropertiesService = async (query: PropertyQueryInput) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const where = buildPropertyWhere(query);

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
  payload: UpdatePropertyInput
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
      where: { id: payload.categoryId },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  const updated = await prisma.property.update({
    where: { id },
    data: buildPropertyUpdateData(payload),
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
  query: PropertyQueryInput
) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const where: Prisma.PropertyWhereInput = { landlordId };

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
