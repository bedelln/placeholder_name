import { NextFunction, Request, Response } from "express";

import * as groupService from "../services/group.service";

export async function listGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const groups = await groupService.listGroups(req.userId!);
    res.json({ groups });
  } catch (error) {
    next(error);
  }
}

export async function getGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const group = await groupService.getGroupById(id, req.userId!);
    res.json({ group });
  } catch (error) {
    next(error);
  }
}

export async function createGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const group = await groupService.createGroup(req.userId!, req.body);
    res.status(201).json({ group });
  } catch (error) {
    next(error);
  }
}

export async function addGroupMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const group = await groupService.addGroupMembers(id, req.userId!, req.body);
    res.json({ group });
  } catch (error) {
    next(error);
  }
}

export async function renameGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const group = await groupService.renameGroup(id, req.userId!, req.body);
    res.json({ group });
  } catch (error) {
    next(error);
  }
}

export async function removeGroupMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, memberUserId } = req.params as { id: string; memberUserId: string };
    const group = await groupService.removeGroupMember(id, req.userId!, memberUserId);
    res.json({ group });
  } catch (error) {
    next(error);
  }
}
