import { NextFunction, Request, Response } from "express";

import { loginUser, registerUser } from "../services/auth.service";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      message: "Registration successful",
      user
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await loginUser(req.body);

    res.status(200).json({
      message: "Login successful",
      ...result
    });
  } catch (error) {
    next(error);
  }
}
