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
} from "../controllers/Job.controller";

const router = express.Router();

// Get all jobs with filters
router.get("/", getAllJobs);

// Get recommended jobs (Jobs You May Like)
router.get("/recommended", getRecommendedJobs);

// Search jobs
router.get("/search", searchJobs);

// Get job by ID
router.get("/:id", getJobById);

// Create new job
router.post("/", createJob);

// Update job
router.put("/:id", updateJob);

// Delete job
router.delete("/:id", deleteJob);

export default router;
