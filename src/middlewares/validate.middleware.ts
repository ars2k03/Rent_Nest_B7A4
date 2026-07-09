import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { sendError } from "../utils/apiResponse.js";

type ValidationTarget = "body" | "query" | "params";

export const validate =
  <T>(schema: ZodType<T>, target: ValidationTarget = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return sendError(res, "Validation failed", 400, result.error.flatten());
    }

    req[target] = result.data as (typeof req)[typeof target];
    return next();
  };
