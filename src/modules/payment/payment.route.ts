import express from "express";
import {
  confirmPayment,
  createPayment,
  getPaymentById,
  getPaymentHistory,
  sslCommerzCallback,
  stripeWebhook,
} from "./payment.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  confirmPaymentSchema,
  createPaymentSchema,
  paymentIdSchema,
  paymentQuerySchema,
} from "../../validators/payment.validator.js";

const router = express.Router();

router.get("/sslcommerz/callback", sslCommerzCallback);
router.post("/webhook/stripe", stripeWebhook);

router.use(authenticate(), authorize("TENANT"));

router.post("/create", validate(createPaymentSchema), createPayment);
router.post("/confirm", validate(confirmPaymentSchema), confirmPayment);
router.get("/", validate(paymentQuerySchema, "query"), getPaymentHistory);
router.get("/:id", validate(paymentIdSchema, "params"), getPaymentById);

export default router;
