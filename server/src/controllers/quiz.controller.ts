import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { quizAnalyzeSchema } from "../utils/validation";
import { runGiftDetective } from "../services/recommendationEngine";
import { ApiError } from "../middleware/error.middleware";

const getIdParam = (req: Request): string => {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
};

export const analyzeQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = quizAnalyzeSchema.parse(req.body);
    const { recipient, occasion, budget } = validated;

    // Fetch all active gift ideas from database
    const allGifts = await prisma.giftIdea.findMany({
      where: { isCurated: true },
    });

    // Run the Gift Detective Scoring & Reasoning Engine
    const recommendations = runGiftDetective(allGifts, recipient, occasion, budget, {
      limit: 10,
      minScoreThreshold: 25,
    });

    // Normalize dislikes as array for storage
    const dislikesArray = Array.isArray(recipient.dislikes)
      ? recipient.dislikes
      : [recipient.dislikes].filter(Boolean);

    // Persist this investigation session
    const session = await prisma.quizSession.create({
      data: {
        userId: req.user?.id || null,
        recipientName: recipient.name,
        relationship: recipient.relationship,
        occasion: occasion.type,
        budgetMin: budget.min || null,
        budgetMax: budget.max || null,
        interests: recipient.interests,
        personality: recipient.personalityTraits,
        favoriteColors: recipient.favoriteColors,
        likes: recipient.likes,
        dislikes: dislikesArray,
        answers: validated as any,
        recommendations: recommendations as any,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Gift Detective investigated ${allGifts.length} clues and identified ${recommendations.length} prime gift matches.`,
      sessionId: session.id,
      investigationReport: {
        target: `${recipient.relationship} (${recipient.name})`,
        occasion: occasion.type,
        budgetRange: budget.max
          ? `₹${(budget.min || 0).toLocaleString("en-IN")} – ₹${budget.max.toLocaleString("en-IN")}`
          : "Flexible",
        cluesAnalyzed: {
          interestsCount: recipient.interests.length,
          traitsCount: recipient.personalityTraits.length,
          colors: recipient.favoriteColors,
        },
      },
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await prisma.quizSession.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizSessionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getIdParam(req);
    const session = await prisma.quizSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new ApiError(404, "Investigation session not found");
    }

    if (session.userId && session.userId !== req.user?.id) {
      throw new ApiError(403, "You do not have permission to view this investigation");
    }

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};
