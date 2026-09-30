import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { savedGiftSchema, updateSavedGiftSchema } from "../utils/validation";
import { ApiError } from "../middleware/error.middleware";

const getIdParam = (req: Request): string => {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
};

export const getSavedGifts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const savedGifts = await prisma.savedGift.findMany({
      where: { userId: req.user!.id },
      include: {
        giftIdea: true,
        recipient: {
          select: {
            id: true,
            name: true,
            relationship: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      savedGifts,
    });
  } catch (error) {
    next(error);
  }
};

export const saveGift = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = savedGiftSchema.parse(req.body);

    // Verify gift idea exists
    const gift = await prisma.giftIdea.findUnique({
      where: { id: validated.giftIdeaId },
    });

    if (!gift) {
      throw new ApiError(404, "Gift idea not found");
    }

    // If recipientId provided, verify ownership
    if (validated.recipientId) {
      const recipient = await prisma.recipient.findUnique({
        where: { id: validated.recipientId },
      });

      if (!recipient) {
        throw new ApiError(404, "Recipient not found");
      }

      if (recipient.userId !== req.user!.id) {
        throw new ApiError(403, "You do not have permission to link this recipient");
      }
    }

    // Check for existing saved gift for this user and giftIdea (and recipient)
    const existing = await prisma.savedGift.findFirst({
      where: {
        userId: req.user!.id,
        giftIdeaId: validated.giftIdeaId,
        recipientId: validated.recipientId || null,
      },
    });

    let saved;
    if (existing) {
      saved = await prisma.savedGift.update({
        where: { id: existing.id },
        data: {
          status: validated.status || existing.status,
          customNotes: validated.customNotes !== undefined ? validated.customNotes : existing.customNotes,
        },
        include: {
          giftIdea: true,
          recipient: true,
        },
      });
    } else {
      saved = await prisma.savedGift.create({
        data: {
          userId: req.user!.id,
          recipientId: validated.recipientId || null,
          giftIdeaId: validated.giftIdeaId,
          status: validated.status || "CONSIDERING",
          customNotes: validated.customNotes,
        },
        include: {
          giftIdea: true,
          recipient: true,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Gift saved to your detective casebook",
      savedGift: saved,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSavedGift = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getIdParam(req);
    const existing = await prisma.savedGift.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "Saved gift not found");
    }

    if (existing.userId !== req.user!.id) {
      throw new ApiError(403, "You do not have permission to update this saved gift");
    }

    const validated = updateSavedGiftSchema.parse(req.body);

    const updated = await prisma.savedGift.update({
      where: { id },
      data: validated,
      include: {
        giftIdea: true,
        recipient: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Saved gift updated",
      savedGift: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSavedGift = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getIdParam(req);
    const existing = await prisma.savedGift.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "Saved gift not found");
    }

    if (existing.userId !== req.user!.id) {
      throw new ApiError(403, "You do not have permission to remove this saved gift");
    }

    await prisma.savedGift.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Saved gift removed",
    });
  } catch (error) {
    next(error);
  }
};
