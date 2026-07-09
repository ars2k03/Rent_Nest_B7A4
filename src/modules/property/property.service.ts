import { prisma } from "../../lib/prisma.js";

export const createPropertyService = async (payload: any) => {
  const result = await prisma.property.create({
    data: payload,
    include: {
      landlord: true,
      category: true,
    },
  });

  return result;
};

export const getAllPropertiesService = async () => {
  const result = await prisma.property.findMany({
    include: {
      landlord: true,
      category: true,
      reviews: true,
    },
  });

  return result;
};

export const getSinglePropertyService = async (id: string) => {
  const result = await prisma.property.findUnique({
    where: {
      id,
    },
    include: {
      landlord: true,
      category: true,
      rentalRequests: true,
      reviews: true,
    },
  });

  if (!result) {
    throw new Error("Property not found");
  }

  return result;
};