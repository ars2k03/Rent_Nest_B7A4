import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./router/auth.route.js";
import propertyRoutes from "./modules/property/property.route.js";
import rentalRoutes from "./modules/rental/rental.route.js";
import categoryRoutes from "./modules/category/category.route.js";
import landlordRoutes from "./modules/landlord/landlord.route.js";
import paymentRoutes from "./modules/payment/payment.route.js";
import reviewRoutes from "./modules/review/review.route.js";
import adminRoutes from "./modules/admin/admin.route.js";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";

const app = express();
const port = Number(process.env.PORT) || 8000;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use("/api/payments/webhook/stripe", express.raw({ type: "application/json" }));
app.use(express.json());

app.get("/", (req : Request, res : Response) => {
  res.status(200).json({
    success: true,
    message: "RentNest API is running...",
    errorDetails: null,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/landlord", landlordRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
