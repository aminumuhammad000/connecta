// src/routes/Job.routes.ts
import express from "express";
import {
  getAllJobs,
  getAllJobsAdmin,
  getJobById,
  createJob,
  bulkCreateJobs,
  updateJob,
  deleteJob,
  getClientJobs,
  getMatchedJobs,
  updateJobStatus
} from "../controllers/Job.controller.js";
import { authenticate, optionalAuthenticate } from "../core/middleware/auth.middleware.js";
import { isAdmin } from "../core/middleware/admin.middleware.js";

const router = express.Router();

// Admin: Get all jobs regardless of status (must be BEFORE /:id)
router.get("/admin/all", authenticate, isAdmin, getAllJobsAdmin);

// Admin: Bulk create jobs
router.post("/bulk", authenticate, isAdmin, bulkCreateJobs);

// Get jobs for the current client (protected)
router.get("/client/my-jobs", authenticate, getClientJobs);

// Get matched/recommended jobs for freelancer (protected)
router.get("/recommended", authenticate, getMatchedJobs);
router.get("/matched", authenticate, getMatchedJobs);


// Get all jobs with filters (Optional auth for filtering applied jobs)
router.get("/", optionalAuthenticate, getAllJobs);

// Get job by ID
router.get("/:id", getJobById);


// Create new job (protected)
router.post("/", authenticate, createJob);

// Update job
router.put("/:id", authenticate, updateJob);

// Delete job
router.delete("/:id", authenticate, isAdmin, deleteJob);

// Update job status (Admin only)
router.patch("/:id/status", authenticate, isAdmin, updateJobStatus);

export default router;

