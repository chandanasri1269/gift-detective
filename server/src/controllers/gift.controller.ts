import { Request, Response, NextFunction } from "express";
import { giftQuerySchema } from "../utils/validation";
import * as giftService from "../services/gift.service";

export const getGifts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = giftQuerySchema.parse(req.query);
    const result = await giftService.getFilteredGifts(filters);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getGiftById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const gift = await giftService.getGiftById(id);

    return res.status(200).json({
      success: true,
      gift,
    });
  } catch (error) {
    next(error);
  }
};
