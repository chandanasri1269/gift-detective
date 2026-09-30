import { Router } from "express";
import * as quizController from "../controllers/quiz.controller";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware";

const router = Router();

// Guest or logged-in users can run the investigation
router.post("/analyze", optionalAuth, quizController.analyzeQuiz);

// Past sessions require login
router.get("/sessions", requireAuth, quizController.getQuizSessions);
router.get("/sessions/:id", optionalAuth, quizController.getQuizSessionById);

export default router;
