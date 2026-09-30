import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const errorMessages = err.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: errorMessages,
    });
  }

  // Handle Custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle Prisma Unique Constraint Violation (P2002)
  if (err.code === "P2002") {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : "field";
    return res.status(409).json({
      success: false,
      message: `A record with this ${target} already exists.`,
    });
  }

  // Handle Prisma Record Not Found (P2025)
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Requested record not found.",
    });
  }

  // Handle JWT Verification Errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authorization token.",
    });
  }

  // Default Internal Server Error
  console.error("Unhandled Server Error:", err);
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message || "Internal server error",
  });
};
