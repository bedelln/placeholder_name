import { NextFunction, Request, Response } from "express";

import * as leaderboardService from "../services/leaderboard.service";

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const groupId = typeof req.query.groupId === "string" ? req.query.groupId : undefined;
    const leaderboard = await leaderboardService.getLeaderboard(userId, groupId);
    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
}
