import { NextFunction, Request, Response } from "express";

import { getCurrentUser } from "../services/user.service";

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getCurrentUser(req.userId!);

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}
