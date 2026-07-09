import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";
import { sendError } from "../utils/apiResponse.js";

type ValidationTarget = "body" | "query" | "params";

export const validate =
  (schema: ZodTypeAny, target: ValidationTarget = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return sendError(res, "Validation failed", 400, result.error.flatten());
    }

    req[target] = result.data;
    return next();
  };
