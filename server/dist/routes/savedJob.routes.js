// src/routes/savedJob.routes.ts
import express from "express";
import { getSavedJobs, saveJob, removeSavedJob, checkIfJobSaved, } from "../controllers/SavedJob.controller.js";
import { authenticate } from "../core/middleware/auth.middleware.js";
const router = express.Router();
router.get("/", authenticate, getSavedJobs);
router.get("/all", authenticate, getSavedJobs);
router.get("/:id/check", authenticate, checkIfJobSaved);
router.post("/:id", authenticate, saveJob);
router.delete("/:id", authenticate, removeSavedJob);
export default router;
