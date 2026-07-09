import { prisma } from "../../lib/prisma.js";

export const createRentalService = async (payload: any) => {
  return await prisma.rentalRequest.create({
    data: payload,
  });
};

export const getAllRentalService = async () => {
  return await prisma.rentalRequest.findMany({
    include: {
      tenant: true,
      property: true,
      payment: true,
    },
  });
};

export const getSingleRentalService = async (id: string) => {
  return await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      tenant: true,
      property: true,
      payment: true,
    },
  });
};

export const updateRentalStatusService = async (
  id: string,
  payload: any
) => {
  return await prisma.rentalRequest.update({
    where: { id },
    data: payload,
  });
};