import { Router } from "express";
import { generateCoverLetter } from "../controllers/CoverLetter.controller";

const router = Router();

router.post("/generate", generateCoverLetter);

export default router;
