import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/auth.routes";
import recipientRoutes from "./routes/recipient.routes";
import occasionRoutes from "./routes/occasion.routes";
import giftRoutes from "./routes/gift.routes";
import quizRoutes from "./routes/quiz.routes";
import savedGiftRoutes from "./routes/savedGift.routes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();
const allowedOrigins = (
  process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. same-origin browser requests, curl, internal calls)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        Boolean(process.env.VERCEL)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
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

// Static client serving (for unified full-stack deployments)
const clientDistPath = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api") || req.method !== "GET") return next();
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// 404 Catch-all for API endpoints
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Requested API endpoint not found",
  });
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
