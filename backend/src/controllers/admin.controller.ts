import { NextFunction, Request, Response } from "express";
import {
    deleteChallenge,
    deleteUser,
    getUserDetail,
    listUsers,
    updateUserXp
} from "../services/admin.service";

export async function handleListUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search as string | undefined;

    const result = await listUsers(limit, offset, search);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleGetUserDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const result = await getUserDetail(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateUserXp(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const { xp } = req.body;

    if (typeof xp !== "number") {
      return res.status(400).json({ message: "XP must be a number" });
    }

    const user = await updateUserXp(userId, xp);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const result = await deleteUser(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteChallenge(req: Request, res: Response, next: NextFunction) {
  try {
    const { challengeId } = req.params;
    const result = await deleteChallenge(challengeId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
