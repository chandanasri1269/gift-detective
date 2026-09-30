import { Router } from "express";
import * as occasionController from "../controllers/occasion.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", occasionController.getOccasions);
router.get("/:id", occasionController.getOccasionById);
router.post("/", occasionController.createOccasion);
router.put("/:id", occasionController.updateOccasion);
router.delete("/:id", occasionController.deleteOccasion);

export default router;
