import Stripe from "stripe";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../../utils/pagination.js";
import { markRentalActiveService } from "../rental/rental.service.js";
import type {
  ConfirmPaymentInput,
  CreatePaymentInput,
  PaymentQueryInput,
} from "../../validators/payment.validator.js";
import type { PaymentStatus, Prisma, UserRole } from "@prisma/client";

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new AppError("Stripe is not configured", 500);
  }

  return new Stripe(secretKey);
};

export const createPaymentService = async (
  tenantId: string,
  payload: CreatePaymentInput
) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: payload.rentalRequestId },
    include: {
      property: true,
      payment: true,
    },
  });

  if (!rental) {
    throw new AppError("Rental request not found", 404);
  }

  if (rental.tenantId !== tenantId) {
    throw new AppError("You can only pay for your own rental requests", 403);
  }

  if (rental.status !== "APPROVED") {
    throw new AppError("Payment is only allowed for approved rental requests", 400);
  }

  if (rental.payment?.status === "COMPLETED") {
    throw new AppError("Payment already completed for this rental request", 409);
  }

  const amount = rental.property.price;

  if (payload.provider === "STRIPE") {
    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: {
        rentalRequestId: rental.id,
        tenantId,
      },
    });

    const payment = await prisma.payment.upsert({
      where: { rentalRequestId: rental.id },
      update: {
        amount,
        provider: "STRIPE",
        status: "PENDING",
        transactionId: paymentIntent.id,
        method: "card",
      },
      create: {
        amount,
        provider: "STRIPE",
        status: "PENDING",
        transactionId: paymentIntent.id,
        method: "card",
        rentalRequestId: rental.id,
      },
    });

    return {
      payment,
      clientSecret: paymentIntent.client_secret,
      provider: "STRIPE" as const,
    };
  }

  const transactionId = `SSLC-${rental.id}-${Date.now()}`;
  const payment = await prisma.payment.upsert({
    where: { rentalRequestId: rental.id },
    update: {
      amount,
      provider: "SSLCOMMERZ",
      status: "PENDING",
      transactionId,
      method: "sslcommerz",
    },
    create: {
      amount,
      provider: "SSLCOMMERZ",
      status: "PENDING",
      transactionId,
      method: "sslcommerz",
      rentalRequestId: rental.id,
    },
  });

  return {
    payment,
    redirectUrl: `${process.env.APP_URL || "http://localhost:8000"}/api/payments/sslcommerz/callback?transactionId=${transactionId}`,
    provider: "SSLCOMMERZ" as const,
  };
};

export const confirmPaymentService = async (
  tenantId: string,
  payload: ConfirmPaymentInput
) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: payload.rentalRequestId },
    include: { payment: true, property: true },
  });

  if (!rental) {
    throw new AppError("Rental request not found", 404);
  }

  if (rental.tenantId !== tenantId) {
    throw new AppError("You can only confirm your own payments", 403);
  }

  if (!rental.payment) {
    throw new AppError("Payment record not found", 404);
  }

  if (rental.payment.status === "COMPLETED") {
    return rental.payment;
  }

  if (rental.payment.transactionId !== payload.transactionId) {
    throw new AppError("Transaction ID does not match", 400);
  }

  if (payload.provider === "STRIPE") {
    const stripe = getStripe();
    const intentId = payload.paymentIntentId || payload.transactionId;
    const paymentIntent = await stripe.paymentIntents.retrieve(intentId);

    if (paymentIntent.status !== "succeeded") {
      await prisma.payment.update({
        where: { id: rental.payment.id },
        data: { status: "FAILED" },
      });
      throw new AppError("Stripe payment not completed", 400);
    }
  }

  const payment = await prisma.payment.update({
    where: { id: rental.payment.id },
    data: {
      status: "COMPLETED",
      paidAt: new Date(),
      provider: payload.provider,
    },
  });

  await markRentalActiveService(rental.id);

  return payment;
};

export const getPaymentHistoryService = async (
  userId: string,
  role: UserRole,
  query: PaymentQueryInput
) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);

  const where: Prisma.PaymentWhereInput =
    role === "ADMIN"
      ? {
          ...(query.status ? { status: query.status as PaymentStatus } : {}),
        }
      : {
          rentalRequest: { tenantId: userId },
          ...(query.status ? { status: query.status as PaymentStatus } : {}),
        };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        rentalRequest: {
          include: {
            property: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    meta: buildPaginationMeta(total, page, limit),
  };
};

export const getPaymentByIdService = async (
  id: string,
  userId: string,
  role: UserRole
) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      rentalRequest: {
        include: {
          property: true,
          tenant: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  const isOwner = payment.rentalRequest.tenantId === userId;
  const isAdmin = role === "ADMIN";

  if (!isOwner && !isAdmin) {
    throw new AppError("You do not have permission to view this payment", 403);
  }

  return payment;
};

export const confirmSslCommerzCallbackService = async (transactionId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId },
    include: { rentalRequest: true },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (payment.status === "COMPLETED") {
    return payment;
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "COMPLETED",
      paidAt: new Date(),
    },
  });

  await markRentalActiveService(payment.rentalRequestId);

  return updatedPayment;
};

export const handleStripeWebhookService = async (rawBody: Buffer, signature: string) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new AppError("Stripe webhook secret is not configured", 500);
  }

  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const rentalRequestId = paymentIntent.metadata.rentalRequestId;

    if (!rentalRequestId) {
      return { received: true };
    }

    const payment = await prisma.payment.findFirst({
      where: { transactionId: paymentIntent.id },
    });

    if (payment && payment.status !== "COMPLETED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
        },
      });
      await markRentalActiveService(rentalRequestId);
    }
  }

  return { received: true };
};
