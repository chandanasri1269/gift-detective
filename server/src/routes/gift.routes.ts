import { Router } from "express";
import * as giftController from "../controllers/gift.controller";

const router = Router();

router.get("/", giftController.getGifts);
router.get("/:id", giftController.getGiftById);

export default router;
