import { Router } from "express";
import { getMatchedGigs } from "../controllers/Gig.controller";

const router = Router();

router.post("/matches", getMatchedGigs);

export default router;
