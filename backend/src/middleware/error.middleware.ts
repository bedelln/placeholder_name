import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { ApiError } from "../utils/errors";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0]?.message ?? "Validation failed";

    return res.status(400).json({
      message: firstIssue,
      errors: error.flatten().fieldErrors
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Internal server error"
  });
}
