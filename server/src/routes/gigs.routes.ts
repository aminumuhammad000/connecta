import express from "express";
import {
  getMatchedGigs,
  applyToGig,
  saveGig,
  getSavedGigs,
  trackApplications,
  getRecommendedGigs,
} from "../controllers/gigs.controller";

const router = express.Router();

router.get("/matched", getMatchedGigs);
router.post("/:gigId/apply", applyToGig);
router.post("/:gigId/save", saveGig);
router.get("/saved", getSavedGigs);
router.get("/applications", trackApplications);
router.get("/recommendations", getRecommendedGigs);

export default router;
