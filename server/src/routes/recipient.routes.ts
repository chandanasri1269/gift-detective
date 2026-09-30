import { Router } from "express";
import * as recipientController from "../controllers/recipient.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", recipientController.getRecipients);
router.get("/:id", recipientController.getRecipientById);
router.post("/", recipientController.createRecipient);
router.put("/:id", recipientController.updateRecipient);
router.delete("/:id", recipientController.deleteRecipient);

export default router;
