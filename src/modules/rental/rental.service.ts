import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../../utils/pagination.js";
import { sanitizeUser } from "../../utils/sanitizeUser.js";
import type { RentalStatus } from "../../../generated/prisma/client.js";

type RentalQuery = {
  status?: RentalStatus;
  page?: string;
  limit?: string;
};

const rentalInclude = {
  tenant: true,
  property: {
    include: {
      landlord: true,
      category: true,
    },
  },
  payment: true,
};

const formatRental = (rental: {
  tenant: { password: string };
  property: { landlord: { password: string } };
} & Record<string, unknown>) => ({
  ...rental,
  tenant: sanitizeUser(rental.tenant),
  property: {
    ...rental.property,
    landlord: sanitizeUser(rental.property.landlord),
  },
});

export const createRentalService = async (
  tenantId: string,
  payload: { propertyId: string; moveInDate: Date; message?: string }
) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (!property.isAvailable) {
    throw new AppError("Property is not available", 400);
  }

  if (property.landlordId === tenantId) {
    throw new AppError("You cannot request your own property", 400);
  }

  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
    },
  });

  if (existingRequest) {
    throw new AppError("You already have an active request for this property", 409);
  }

  const rental = await prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      moveInDate: payload.moveInDate,
      ...(payload.message ? { message: payload.message } : {}),
    },
    include: rentalInclude,
  });

  return formatRental(rental);
};

export const getTenantRentalsService = async (
  tenantId: string,
  query: RentalQuery
) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const where = {
    tenantId,
    ...(query.status ? { status: query.status } : {}),
  };

  const [rentals, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      where,
      include: rentalInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.rentalRequest.count({ where }),
  ]);

  return {
    rentals: rentals.map((rental) => formatRental(rental)),
    meta: buildPaginationMeta(total, page, limit),
  };
};

export const getSingleRentalService = async (id: string, userId: string, role: string) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id },
    include: rentalInclude,
  });

  if (!rental) {
    throw new AppError("Rental request not found", 404);
  }

  const isTenant = rental.tenantId === userId;
  const isLandlord = rental.property.landlordId === userId;
  const isAdmin = role === "ADMIN";

  if (!isTenant && !isLandlord && !isAdmin) {
    throw new AppError("You do not have permission to view this rental request", 403);
  }

  return formatRental(rental);
};

export const getLandlordRentalRequestsService = async (
  landlordId: string,
  query: RentalQuery
) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);

  const where = {
    property: { landlordId },
    ...(query.status ? { status: query.status } : {}),
  };

  const [rentals, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      where,
      include: rentalInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.rentalRequest.count({ where }),
  ]);

  return {
    rentals: rentals.map((rental) => formatRental(rental)),
    meta: buildPaginationMeta(total, page, limit),
  };
};

export const updateLandlordRentalStatusService = async (
  id: string,
  landlordId: string,
  status: "APPROVED" | "REJECTED" | "COMPLETED"
) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id },
    include: { property: true },
  });

  if (!rental) {
    throw new AppError("Rental request not found", 404);
  }

  if (rental.property.landlordId !== landlordId) {
    throw new AppError("You can only manage requests for your own properties", 403);
  }

  if (status === "COMPLETED") {
    if (rental.status !== "ACTIVE") {
      throw new AppError("Only active rentals can be marked as completed", 400);
    }
  } else if (rental.status !== "PENDING") {
    throw new AppError("Only pending requests can be approved or rejected", 400);
  }

  const updated = await prisma.rentalRequest.update({
    where: { id },
    data: { status },
    include: rentalInclude,
  });

  return formatRental(updated);
};

export const markRentalActiveService = async (rentalRequestId: string) => {
  return prisma.rentalRequest.update({
    where: { id: rentalRequestId },
    data: { status: "ACTIVE" },
  });
};

export const getAllRentalsService = async (query: RentalQuery) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const where = query.status ? { status: query.status } : {};

  const [rentals, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      where,
      include: rentalInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.rentalRequest.count({ where }),
  ]);

  return {
    rentals: rentals.map((rental) => formatRental(rental)),
    meta: buildPaginationMeta(total, page, limit),
  };
};
