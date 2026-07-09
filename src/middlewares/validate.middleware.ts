import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

type ValidationTarget = "body" | "query" | "params" | "headers";

export const validate =
  <T>(schema: ZodType<T>, target: ValidationTarget = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return next(result.error);
    }

    if (target !== "headers") {
      req[target] = result.data as (typeof req)[typeof target];
    }

    return next();
  };
