import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { sanitizeUser } from "../../utils/sanitizeUser.js";

export const createReviewService = async (
  tenantId: string,
  payload: { propertyId: string; rating: number; comment: string }
) => {
  const completedRental = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: "COMPLETED",
    },
  });

  if (!completedRental) {
    throw new AppError(
      "You can only review properties after a completed rental",
      400
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
    },
  });

  if (existingReview) {
    throw new AppError("You have already reviewed this property", 409);
  }

  const review = await prisma.review.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      rating: payload.rating,
      comment: payload.comment,
    },
    include: {
      tenant: true,
      property: true,
    },
  });

  return {
    ...review,
    tenant: sanitizeUser(review.tenant),
  };
};
