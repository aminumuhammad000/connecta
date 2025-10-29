// ===================
// Get Jobs for Current Client
// ===================
export const getClientJobs = async (req: Request, res: Response) => {
  try {
    // Use (req.user as any) to avoid TS errors
    const clientId = (req.user as any)?._id || (req.user as any)?.id;
    if (!clientId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const jobs = await Job.find({ clientId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};
// src/controllers/Job.controller.ts
import { Request, Response } from "express";
import Job from "../models/Job.model";

// ===================
// Get All Jobs
// ===================
export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      location, 
      jobType, 
      locationType, 
      skills,
      limit = 10,
      page = 1 
    } = req.query;

    const filter: any = { status: "active" };

    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (jobType) filter.jobType = jobType;
    if (locationType) filter.locationType = locationType;
    if (skills) filter.skills = { $in: (skills as string).split(",") };

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(filter)
      .sort({ posted: -1 })
      .limit(Number(limit))
      .skip(skip)
      .populate("clientId", "firstName lastName email");

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ===================
// Get Job by ID
// ===================
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate("clientId", "firstName lastName email");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ===================
// Create Job
// ===================
export const createJob = async (req: Request, res: Response) => {
  try {
    const jobData = req.body;
    // Set clientId from authenticated user (use any to avoid TS error)
    const clientId = (req.user as any)?._id || (req.user as any)?.id;
    if (!clientId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No clientId" });
    }
    jobData.clientId = clientId;
    const newJob = await Job.create(jobData);
    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: newJob,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ===================
// Update Job
// ===================
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedJob) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ===================
// Delete Job
// ===================
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ===================
// Get Recommended Jobs (Jobs You May Like)
// ===================
export const getRecommendedJobs = async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;

    // Get active jobs, sorted by posted date
    const jobs = await Job.find({ status: "active" })
      .sort({ posted: -1 })
      .limit(Number(limit))
      .populate("clientId", "firstName lastName email");

    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ===================
// Search Jobs
// ===================
export const searchJobs = async (req: Request, res: Response) => {
  try {
    const { q, limit = 10, page = 1 } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: "Search query required" });
    }

    const filter = {
      status: "active",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { skills: { $in: [(q as string)] } },
        { company: { $regex: q, $options: "i" } },
      ],
    };

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(filter)
      .sort({ posted: -1 })
      .limit(Number(limit))
      .skip(skip)
      .populate("clientId", "firstName lastName email");

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};
