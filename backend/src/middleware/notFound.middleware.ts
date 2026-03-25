import { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/errors";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}
