import { Request, Response } from "express";
import Job from "../models/Job.model";
import User from "../models/user.model";
import Profile from "../models/Profile.model";
import { RecommendationService } from "../services/recommendation.service";
import { sendGigNotificationEmail } from "../services/email.service";

// ===================
// Get Jobs for Current Client
// ===================
// ===================
// Get Jobs for Current Client
// ===================
export const getClientJobs = async (req: Request, res: Response) => {
  try {
    // Use (req as any).user to avoid TS errors
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
    const clientId = (req as any).user?._id || (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No clientId" });
    }
    jobData.clientId = clientId;
    const newJob = await Job.create(jobData);

    // Send notifications to matching freelancers
    // We do this asynchronously so we don't block the response
    (async () => {
      try {
        if (!newJob.skills || newJob.skills.length === 0) return;

        // Find profiles that have at least one matching skill
        const matchingProfiles = await Profile.find({
          skills: { $in: newJob.skills }
        }).populate("user");

        const notifiedUserIds = new Set();

        for (const profile of matchingProfiles) {
          const user = profile.user as any;

          // Check if user exists, is a freelancer, is subscribed, and hasn't been notified yet
          if (
            user &&
            user.userType === "freelancer" &&
            user.isSubscribedToGigs !== false && // Default is true if undefined
            !notifiedUserIds.has(user._id.toString())
          ) {
            notifiedUserIds.add(user._id.toString());

            // Construct job link (adjust base URL as needed)
            const jobLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/gigs/${newJob._id}`;

            await sendGigNotificationEmail(
              user.email,
              user.firstName,
              newJob.title,
              jobLink,
              newJob.skills
            );
            console.log(`Gig notification email sent to ${user.email}`);
          }
        }
      } catch (error) {
        console.error("Error sending gig notifications:", error);
      }
    })();

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
    const userId = (req as any).user?._id || (req as any).user?.id;

    if (!userId) {
      // Fallback to existing logic if no user logged in
      const jobs = await Job.find({ status: "active" })
        .sort({ posted: -1 })
        .limit(Number(limit))
        .populate("clientId", "firstName lastName email");
      return res.status(200).json({ success: true, data: jobs });
    }

    const recommendationService = new RecommendationService();
    const jobs = await recommendationService.getRecommendationsForUser(userId, Number(limit));

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
