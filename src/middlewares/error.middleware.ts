import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { sendError } from "../utils/apiResponse.js";

const isPrismaError = (
  err: unknown
): err is { code: string; meta?: { target?: unknown } } => {
  return typeof err === "object" && err !== null && "code" in err;
};

export const notFoundHandler = (req: Request, res: Response) => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
};

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errorDetails);
  }

  if (err instanceof ZodError) {
    return sendError(res, "Validation failed", 400, err.flatten());
  }

  if (isPrismaError(err)) {
    if (err.code === "P2002") {
      return sendError(res, "Duplicate value detected", 409, {
        target: err.meta?.target,
      });
    }

    if (err.code === "P2025") {
      return sendError(res, "Record not found", 404, null);
    }

    if (err.code === "P2003") {
      return sendError(res, "Invalid relation reference", 400, null);
    }

    return sendError(res, "Database operation failed", 500, {
      code: err.code,
    });
  }

  if (err instanceof jwt.TokenExpiredError) {
    return sendError(res, "Token expired", 401, { code: "TOKEN_EXPIRED" });
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return sendError(res, "Invalid token", 401, { code: "INVALID_TOKEN" });
  }

  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code?: string }).code;

    if (code === "LIMIT_UNEXPECTED_FILE") {
      return sendError(res, "File upload failed", 400, { code });
    }
  }

  if (err instanceof Error) {
    return sendError(res, err.message, 500);
  }

  return sendError(res, "Internal server error", 500);
};
