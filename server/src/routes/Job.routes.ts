// src/routes/Job.routes.ts
import express from "express";
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecommendedJobs,
  searchJobs,
  getClientJobs,
  saveJob,
  unsaveJob,
  getSavedJobs
} from "../controllers/Job.controller";
import { authenticate } from "../core/middleware/auth.middleware";

const router = express.Router();

// Get jobs for the current client (protected)
router.get("/client/my-jobs", authenticate, getClientJobs);

// Get saved jobs (protected)
router.get("/saved", authenticate, getSavedJobs);

// Save a job (protected)
router.post("/:id/save", authenticate, saveJob);

// Unsave a job (protected)
router.delete("/:id/save", authenticate, unsaveJob);

// Get all jobs with filters
router.get("/", getAllJobs);

// Get recommended jobs (Jobs You May Like)
router.get("/recommended", authenticate, getRecommendedJobs);

// Search jobs
router.get("/search", searchJobs);

// Get job by ID
router.get("/:id", getJobById);

// Create new job (protected)
router.post("/", authenticate, createJob);

// Update job
router.put("/:id", updateJob);

// Delete job
router.delete("/:id", deleteJob);

export default router;
