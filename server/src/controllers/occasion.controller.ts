import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { occasionSchema, updateOccasionSchema } from "../utils/validation";
import { ApiError } from "../middleware/error.middleware";

const getIdParam = (req: Request): string => {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
};

export const getOccasions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const occasions = await prisma.occasion.findMany({
      where: {
        recipient: {
          userId: req.user!.id,
        },
      },
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            relationship: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    return res.status(200).json({
      success: true,
      occasions,
    });
  } catch (error) {
    next(error);
  }
};

export const getOccasionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getIdParam(req);
    const occasion = await prisma.occasion.findUnique({
      where: { id },
      include: {
        recipient: true,
      },
    });

    if (!occasion) {
      throw new ApiError(404, "Occasion not found");
    }

    if (occasion.recipient.userId !== req.user!.id) {
      throw new ApiError(403, "You do not have permission to view this occasion");
    }

    return res.status(200).json({
      success: true,
      occasion,
    });
  } catch (error) {
    next(error);
  }
};

export const createOccasion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = occasionSchema.parse(req.body);

    // Verify recipient belongs to the user
    const recipient = await prisma.recipient.findUnique({
      where: { id: validated.recipientId },
    });

    if (!recipient) {
      throw new ApiError(404, "Recipient not found");
    }

    if (recipient.userId !== req.user!.id) {
      throw new ApiError(403, "You do not have permission to add occasions for this recipient");
    }

    const occasion = await prisma.occasion.create({
      data: validated,
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            relationship: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Occasion created successfully",
      occasion,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOccasion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getIdParam(req);
    const existing = await prisma.occasion.findUnique({
      where: { id },
      include: { recipient: true },
    });

    if (!existing) {
      throw new ApiError(404, "Occasion not found");
    }

    if (existing.recipient.userId !== req.user!.id) {
      throw new ApiError(403, "You do not have permission to update this occasion");
    }

    const validated = updateOccasionSchema.parse(req.body);

    const updated = await prisma.occasion.update({
      where: { id },
      data: validated,
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            relationship: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Occasion updated successfully",
      occasion: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOccasion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getIdParam(req);
    const existing = await prisma.occasion.findUnique({
      where: { id },
      include: { recipient: true },
    });

    if (!existing) {
      throw new ApiError(404, "Occasion not found");
    }

    if (existing.recipient.userId !== req.user!.id) {
      throw new ApiError(403, "You do not have permission to delete this occasion");
    }

    await prisma.occasion.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Occasion deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
