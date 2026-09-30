import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import recipientRoutes from "./routes/recipient.routes";
import occasionRoutes from "./routes/occasion.routes";
import giftRoutes from "./routes/gift.routes";
import quizRoutes from "./routes/quiz.routes";
import savedGiftRoutes from "./routes/savedGift.routes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Gift Detective API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipients", recipientRoutes);
app.use("/api/occasions", occasionRoutes);
app.use("/api/gifts", giftRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/saved-gifts", savedGiftRoutes);

// 404 Catch-all
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Requested API endpoint not found",
  });
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
