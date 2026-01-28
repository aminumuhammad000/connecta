import express from "express";
import { explainFeature, getHelp, sendFeedback, onboarding } from "../controllers/support.controller.js";
const router = express.Router();
router.post("/explain", explainFeature);
router.get("/help", getHelp);
router.post("/feedback", sendFeedback);
router.post("/onboarding", onboarding);
export default router;
