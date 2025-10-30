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
  getClientJobs
} from "../controllers/Job.controller";
import { authenticate } from "../core/middleware/auth.middleware";

const router = express.Router();

// Get jobs for the current client (protected)
router.get("/client/my-jobs", authenticate, getClientJobs);

// Get all jobs with filters
router.get("/", getAllJobs);

// Get recommended jobs (Jobs You May Like)
router.get("/recommended", getRecommendedJobs);

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
