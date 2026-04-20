import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/errors";

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      return next(new ApiError(401, "Not authenticated"));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user || user.role !== "admin") {
      return next(new ApiError(403, "Admin access required"));
    }

    next();
  } catch (error) {
    next(error);
  }
}
