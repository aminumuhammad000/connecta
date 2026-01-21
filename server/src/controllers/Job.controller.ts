import { Request, Response } from "express";
import Job from "../models/Job.model";
import User from "../models/user.model";
import Profile from "../models/Profile.model";

// ===================
// Get Jobs for Current Client
// ===================
// ===================
// Get Jobs for Current Client
// ===================
export const getClientJobs = async (req: Request, res: Response) => {
  try {
    // Use (req.user as any) to avoid TS errors
    const clientId = (req as any).user?._id || (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const jobs = await Job.find({ clientId }).sort({ createdAt: -1 });

    // Calculate proposal counts for each job
    // Dynamically import Proposal to avoid circular dependency issues if any
    const Proposal = require("../models/Proposal.model").default;

    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const count = await Proposal.countDocuments({ jobId: job._id });
      return {
        ...job.toObject(),
        proposalsCount: count
      };
    }));

    res.status(200).json({ success: true, data: jobsWithCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

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
      isExternal,
      status,
      limit = 10,
      page = 1
    } = req.query;

    const filter: any = {};

    if (status) filter.status = status;
    else filter.status = "active";

    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (jobType) filter.jobType = jobType;
    if (locationType) filter.locationType = locationType;
    if (skills) filter.skills = { $in: (skills as string).split(",") };
    if (isExternal !== undefined) filter.isExternal = isExternal === 'true';

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
    const clientId = (req as any).user?._id || (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No clientId" });
    }
    jobData.clientId = clientId;
    const newJob = await Job.create(jobData);

    // Notify matching freelancers via WhatsApp
    try {
      // Import dynamically if needed, or rely on top-level import if I add it.
      // Better to add top-level import.
      const TwilioService = require('../services/twilio.service').default;
      TwilioService.notifyMatchingFreelancers(newJob);
    } catch (notifyErr) {
      console.error("Failed to notify freelancers:", notifyErr);
    }

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
    // @ts-ignore
    const userId = req.user?._id || req.user?.id;

    let filter: any = { status: "active" };

    if (userId) {
      const profile = await Profile.findOne({ user: userId });

      if (profile) {
        const orConditions = [];

        // 1. Match Skills
        if (profile.skills && profile.skills.length > 0) {
          orConditions.push({ skills: { $in: profile.skills } });
        }

        // 2. Match Categories
        if (profile.jobCategories && profile.jobCategories.length > 0) {
          // Assuming job model has 'category' field
          orConditions.push({ category: { $in: profile.jobCategories } });
        }

        // 3. Match Job Title
        if (profile.jobTitle) {
          orConditions.push({ title: { $regex: profile.jobTitle, $options: "i" } });
        }

        if (orConditions.length > 0) {
          filter.$or = orConditions;
        }

        // 4. Match Remote Type if specified (optional strictness)
        if (profile.remoteWorkType === 'remote_only') {
          // Adjust based on Job model schema. Assuming locationType or similar.
          // Job model has locationType?: 'remote' | 'onsite' | 'hybrid';
          filter.locationType = 'remote';
        } else if (profile.remoteWorkType === 'hybrid') {
          filter.locationType = { $in: ['hybrid', 'remote'] };
        }
        // If onsite, we don't strictly filter to onsite usually, or maybe we do.
      }
    }

    // Get active jobs, prioritized by match logic
    let jobs = await Job.find(filter)
      .sort({ posted: -1 })
      .limit(Number(limit) * 2) // Fetch more to filter
      .populate("clientId", "firstName lastName email");

    // Fallback: If no jobs found with strict filter, return recent jobs
    if (jobs.length === 0) {
      jobs = await Job.find({ status: "active" })
        .sort({ posted: -1 })
        .limit(Number(limit))
        .populate("clientId", "firstName lastName email");
    }

    // Scoring and Categorization
    // 1. Calculate Score (Simple overlap match)
    // 2. Prioritize Internal (!isExternal)
    const profileSkills = new Set(await Profile.findOne({ user: userId }).then(p => p?.skills || []));

    let scoredJobs = jobs.map((job) => {
      let score = 0;
      let matchCount = 0;

      // Match Skills
      if (job.skills && job.skills.length > 0) {
        job.skills.forEach(s => {
          if (profileSkills.has(s)) matchCount++;
        });
        score = matchCount / Math.max(job.skills.length, 1);
      } else {
        // If job has no skills listed, give a neutral score if title matches?
        // For now, assume 0.5 baseline for loose matches
        score = 0.5;
      }

      // Boost internal jobs
      if (!job.isExternal) {
        score += 0.2; // Internal boost
      }

      return { job, score };
    });

    // Filter out low scores (< 0.5) UNLESS it's a fallback situation where we need data
    // The user requirement says "if score < 0.5 do not recommend it"
    // We strictly follow this unless no jobs remain, effectively empty.

    // Normalize Score:
    // Pure skill match is 0.0 - 1.0. 
    // Internal boost adds 0.2.
    // So internal jobs with 30% skill match (0.3 + 0.2 = 0.5) pass.
    // External jobs need 50% skill match to pass.

    scoredJobs = scoredJobs.filter(item => item.score >= 0.5);

    // Sort: Higher score first
    scoredJobs.sort((a, b) => b.score - a.score);

    // Take limit
    const finalJobs = scoredJobs.slice(0, Number(limit)).map(item => item.job);

    res.status(200).json({
      success: true,
      data: finalJobs,
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
    const { q, limit = 10, page = 1, isExternal } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: "Search query required" });
    }

    const filter: any = {
      status: "active",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { skills: { $in: [(q as string)] } },
        { company: { $regex: q, $options: "i" } },
      ],
    };

    if (isExternal !== undefined) {
      filter.isExternal = isExternal === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Prioritize internal jobs (isExternal: false (0) comes before true (1))
    const jobs = await Job.find(filter)
      .sort({ isExternal: 1, posted: -1 })
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
// Save Job
// ===================
export const saveJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if already saved
    if (user.savedJobs?.includes(id as any)) {
      return res.status(400).json({ success: false, message: "Job already saved" });
    }

    // Initialize array if undefined
    if (!user.savedJobs) {
      user.savedJobs = [];
    }

    user.savedJobs.push(id as any);
    await user.save();

    res.status(200).json({ success: true, message: "Job saved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ===================
// Unsave Job
// ===================
export const unsaveJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.savedJobs = user.savedJobs?.filter((jobId: any) => jobId.toString() !== id);
    await user.save();

    res.status(200).json({ success: true, message: "Job removed from saved" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ===================
// Get Saved Jobs
// ===================
export const getSavedJobs = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId).populate({
      path: "savedJobs",
      populate: { path: "clientId", select: "firstName lastName email" }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user.savedJobs || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};
