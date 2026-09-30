import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../utils/validation";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = registerSchema.parse(req.body);
    const result = await authService.registerUser(validated);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await authService.loginUser(validated);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
