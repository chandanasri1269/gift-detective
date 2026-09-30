import { Router } from "express";
import * as savedGiftController from "../controllers/savedGift.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", savedGiftController.getSavedGifts);
router.post("/", savedGiftController.saveGift);
router.put("/:id", savedGiftController.updateSavedGift);
router.delete("/:id", savedGiftController.deleteSavedGift);

export default router;
