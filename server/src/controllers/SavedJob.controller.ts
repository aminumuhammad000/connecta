// src/controllers/SavedJob.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import SavedJob from "../models/SavedJob.model.js";
import Job from "../models/Job.model.js";

/**
 * Get all saved jobs for the authenticated user
 */
export const getSavedJobs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const savedRecords = await SavedJob.find({ userId })
      .populate({
        path: "jobId",
        populate: {
          path: "clientId",
          select: "firstName lastName companyName profileImage isVerified location",
        },
      })
      .sort({ createdAt: -1 });

    // Filter out records where the referenced job has been deleted
    const jobs = savedRecords
      .filter((record) => record.jobId != null)
      .map((record) => {
        const rawJob = record.jobId as any;
        const jobObj = typeof rawJob.toObject === "function" ? rawJob.toObject() : rawJob;

        return {
          ...jobObj,
          savedAt: record.createdAt,
          savedRecordId: record._id,
          // Guarantee both _id and jobId match for various client shapes
          jobId: jobObj._id,
          id: jobObj._id,
        };
      });

    return res.status(200).json({
      success: true,
      data: jobs,
      count: jobs.length,
    });
  } catch (error: any) {
    console.error("Error fetching saved jobs:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch saved jobs",
    });
  }
};

/**
 * Save a job for the authenticated user
 */
export const saveJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const jobId = req.params.id || req.body.jobId;
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: "Valid job ID is required" });
    }

    // Verify job exists
    const jobExists = await Job.findById(jobId).select("_id title");
    if (!jobExists) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Upsert to avoid duplicates
    const saved = await SavedJob.findOneAndUpdate(
      { userId, jobId },
      { userId, jobId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Gig saved successfully",
      data: saved,
    });
  } catch (error: any) {
    console.error("Error saving job:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save gig",
    });
  }
};

/**
 * Remove a saved job for the authenticated user
 */
export const removeSavedJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const jobId = req.params.id || req.body.jobId;
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: "Valid job ID is required" });
    }

    await SavedJob.findOneAndDelete({ userId, jobId });

    return res.status(200).json({
      success: true,
      message: "Gig removed from saved collection",
    });
  } catch (error: any) {
    console.error("Error removing saved job:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove saved gig",
    });
  }
};

/**
 * Check if a specific job is saved by the authenticated user
 */
export const checkIfJobSaved = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    if (!userId) {
      return res.status(200).json({ success: true, isSaved: false });
    }

    const jobId = req.params.id;
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: "Valid job ID is required" });
    }

    const exists = await SavedJob.exists({ userId, jobId });

    return res.status(200).json({
      success: true,
      isSaved: Boolean(exists),
    });
  } catch (error: any) {
    console.error("Error checking saved job:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to check saved status",
    });
  }
};
