import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { recipientSchema, updateRecipientSchema } from "../utils/validation";
import { ApiError } from "../middleware/error.middleware";

const getIdParam = (req: Request): string => {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
};

export const getRecipients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipients = await prisma.recipient.findMany({
      where: { userId: req.user!.id },
      include: {
        occasions: {
          orderBy: { date: "asc" },
        },
        savedGifts: {
          include: {
            giftIdea: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      recipients,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecipientById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getIdParam(req);
    const recipient = await prisma.recipient.findUnique({
      where: { id },
      include: {
        occasions: {
          orderBy: { date: "asc" },
        },
        savedGifts: {
          include: {
            giftIdea: true,
          },
        },
      },
    });

    if (!recipient) {
      throw new ApiError(404, "Recipient not found");
    }

    if (recipient.userId !== req.user!.id) {
      throw new ApiError(403, "You do not have permission to view this recipient");
    }

    return res.status(200).json({
      success: true,
      recipient,
    });
  } catch (error) {
    next(error);
  }
};

export const createRecipient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = recipientSchema.parse(req.body);

    const recipient = await prisma.recipient.create({
      data: {
        ...validated,
        userId: req.user!.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Recipient created successfully",
      recipient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRecipient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getIdParam(req);
    const existing = await prisma.recipient.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "Recipient not found");
    }

    if (existing.userId !== req.user!.id) {
      throw new ApiError(403, "You do not have permission to update this recipient");
    }

    const validated = updateRecipientSchema.parse(req.body);

    const updated = await prisma.recipient.update({
      where: { id },
      data: validated,
    });

    return res.status(200).json({
      success: true,
      message: "Recipient updated successfully",
      recipient: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRecipient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getIdParam(req);
    const existing = await prisma.recipient.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "Recipient not found");
    }

    if (existing.userId !== req.user!.id) {
      throw new ApiError(403, "You do not have permission to delete this recipient");
    }

    await prisma.recipient.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Recipient deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
