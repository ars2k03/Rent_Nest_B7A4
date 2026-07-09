import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../../utils/pagination.js";
import { sanitizeUser, sanitizeUsers } from "../../utils/sanitizeUser.js";
import type { AdminQueryInput } from "../../validators/admin.validator.js";
import type { Prisma } from "../../../generated/prisma/client.js";

export const getAllUsersService = async (query: AdminQueryInput) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);

  const where: Prisma.UserWhereInput = {
    ...(query.role ? { role: query.role } : {}),
    ...(query.isDeleted !== undefined ? { isDeleted: query.isDeleted } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: sanitizeUsers(users),
    meta: buildPaginationMeta(total, page, limit),
  };
};

export const updateUserStatusService = async (id: string, isDeleted: boolean) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === "ADMIN") {
    throw new AppError("Admin accounts cannot be banned", 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isDeleted },
  });

  return sanitizeUser(updatedUser);
};

export const getAllAdminPropertiesService = async (query: AdminQueryInput) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      include: {
        landlord: true,
        category: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count(),
  ]);

  return {
    properties: properties.map((property) => ({
      ...property,
      landlord: sanitizeUser(property.landlord),
    })),
    meta: buildPaginationMeta(total, page, limit),
  };
};

export const getAllAdminRentalsService = async (query: AdminQueryInput) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);

  const [rentals, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      include: {
        tenant: true,
        property: {
          include: {
            landlord: true,
          },
        },
        payment: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.rentalRequest.count(),
  ]);

  return {
    rentals: rentals.map((rental) => ({
      ...rental,
      tenant: sanitizeUser(rental.tenant),
      property: {
        ...rental.property,
        landlord: sanitizeUser(rental.property.landlord),
      },
    })),
    meta: buildPaginationMeta(total, page, limit),
  };
};
