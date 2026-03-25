import { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../lib/jwt";
import { ApiError } from "../utils/errors";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authorization token is required"));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}
