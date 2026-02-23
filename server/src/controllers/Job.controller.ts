import { Request, Response } from "express";
import { Job } from "../models/Job.model.js";
import User from "../models/user.model.js";
import Profile from "../models/Profile.model.js";
import Proposal from "../models/Proposal.model.js";
import TwilioService from "../services/twilio.service.js";
import { RecommendationService } from "../services/recommendation.service.js";
import Verification from "../models/Verification.model.js";
import Notification from "../models/Notification.model.js";
import { sendEmail } from "../services/email.service.js";
import { getBaseTemplate } from "../utils/emailTemplates.js";


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

    if (status && status !== 'all') filter.status = status;
    else if (!status) filter.status = "active";

    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (jobType) filter.jobType = jobType;
    if (locationType) filter.locationType = locationType;
    if (skills) filter.skills = { $in: (skills as string).split(",") };
    if (isExternal !== undefined) {
      if (isExternal === 'true') {
        filter.isExternal = true;
      } else {
        filter.isExternal = { $ne: true };
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(filter)
      .sort({ isExternal: 1, posted: -1 }) // Prioritize internal (false=0, true=1)
      .limit(Number(limit))
      .skip(skip)
      .populate("clientId", "firstName lastName email profileImage phoneNumber");

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

    const job = await Job.findById(id).populate("clientId", "firstName lastName email phoneNumber profileImage");

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

    // Check user verification status to determine job status
    const verification = await Verification.findOne({ user: clientId });


    if (verification && verification.status === "approved") {
      jobData.status = "active";
    } else {
      jobData.status = "pending";
    }

    const newJob = await Job.create(jobData);

    // Notify matching freelancers via WhatsApp and Email
    try {
      TwilioService.notifyMatchingFreelancers(newJob);

      const recService = new RecommendationService();
      recService.processNewJob(newJob._id as any);
    } catch (notifyErr) {
      console.error("Failed to notify freelancers:", notifyErr);
    }

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: newJob,
    });
  } catch (err: any) {
    console.error("❌ Error in createJob:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message || err });
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
// Update Job Status (Admin Only)
// ===================
export const updateJobStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "closed", "draft", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const job = await Job.findByIdAndUpdate(id, { status }, { new: true });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // If approved (active), we might want to trigger recommendations here
    if (status === "active") {
      try {
        TwilioService.notifyMatchingFreelancers(job);
        const recService = new RecommendationService();
        recService.processNewJob(job._id as any);
      } catch (notifyErr) {
        console.error("Failed to notify freelancers on approval:", notifyErr);
      }
    }

    res.status(200).json({
      success: true,
      message: `Job status updated to ${status}`,
      data: job,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Server error", error: err.message || err });
  }
};

// ===================
// Get Recommended Jobs (Jobs You May Like)
// ===================
export const getRecommendedJobs = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    // @ts-ignore
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      // Return recent active jobs if not logged in
      const jobs = await Job.find({ status: "active" })
        .sort({ isExternal: 1, posted: -1 })
        .limit(Number(limit))
        .populate("clientId", "firstName lastName email profileImage");
      return res.status(200).json({ success: true, data: jobs });
    }

    const profile = await Profile.findOne({ user: userId });

    let filter: any = { status: "active" };
    const orConditions: any[] = [];

    if (profile) {
      // 1. Match Skills
      if (profile.skills && profile.skills.length > 0) {
        orConditions.push({ skills: { $in: profile.skills } });
      }

      // 2. Match Categories
      if (profile.jobCategories && profile.jobCategories.length > 0) {
        orConditions.push({ category: { $in: profile.jobCategories } });
      }

      // 3. Match Job Title
      if (profile.jobTitle) {
        orConditions.push({ title: { $regex: profile.jobTitle, $options: "i" } });
      }

      if (orConditions.length > 0) {
        filter.$or = orConditions;
      }

      // 4. Match Remote Type
      if (profile.remoteWorkType === 'remote_only') {
        filter.locationType = 'remote';
      } else if (profile.remoteWorkType === 'hybrid') {
        filter.locationType = { $in: ['hybrid', 'remote'] };
      }

      // 5. Engagement Types (Optional filter, better for scoring)
      // if (profile.engagementTypes && profile.engagementTypes.length > 0) {
      //   filter.jobType = { $in: profile.engagementTypes.map(t => t.toLowerCase()) };
      // }
    }

    // Fetch a larger pool of jobs to score and rank
    let jobs = await Job.find(filter)
      .sort({ isExternal: 1, posted: -1 })
      .limit(50)
      .populate("clientId", "firstName lastName email profileImage");

    // Fallback: If no jobs found with strict filter, return recent jobs
    if (jobs.length < 5) {
      const fallbackJobs = await Job.find({ status: "active" })
        .sort({ isExternal: 1, posted: -1 })
        .limit(Number(limit))
        .populate("clientId", "firstName lastName email profileImage");

      // Merge and remove duplicates
      const jobIds = new Set(jobs.map(j => j._id.toString()));
      fallbackJobs.forEach(j => {
        if (!jobIds.has(j._id.toString())) {
          jobs.push(j);
        }
      });
    }

    const profileSkills = new Set(profile?.skills || []);
    const userCategories = new Set(profile?.jobCategories || []);
    const userTitle = profile?.jobTitle?.toLowerCase() || "";
    const userEngagementTypes = new Set((profile?.engagementTypes || []).map(t => t.toLowerCase()));
    const minSalary = profile?.minimumSalary || 0;

    let scoredJobs = jobs.map((job) => {
      let score = 0;

      // 1. Match Skills (Baseline: 0 to 1.0)
      if (job.skills && job.skills.length > 0) {
        let matchCount = 0;
        job.skills.forEach(s => {
          if (profileSkills.has(s)) matchCount++;
        });
        score += (matchCount / Math.max(job.skills.length, 1)) * 1.0;
      }

      // 2. Match Categories (Boost: 0.5)
      if (job.category && userCategories.has(job.category)) {
        score += 0.5;
      }

      // 3. Match Job Title (Boost: 0.8)
      if (userTitle && job.title.toLowerCase().includes(userTitle)) {
        score += 0.8;
      }

      // 4. Engagement Type Match (Boost: 0.4)
      if (job.jobType && userEngagementTypes.has(job.jobType.toLowerCase())) {
        score += 0.4;
      }

      // 5. Salary Match (Boost: 0.3 if salary >= minSalary)
      if (minSalary > 0 && job.salary?.min && job.salary.min >= minSalary) {
        score += 0.3;
      }

      // 6. Prioritize Internal Jobs (Major Boost: 2.0)
      // This ensures internal jobs almost always come first if they have any relevance
      if (!job.isExternal) {
        score += 2.0;
      }

      return { job, score };
    });

    // Sort: Higher score first
    scoredJobs.sort((a, b) => b.score - a.score);

    // Take limit
    const finalJobs = scoredJobs.slice(0, Number(limit)).map(item => item.job);

    res.status(200).json({
      success: true,
      data: finalJobs,
    });
  } catch (err) {
    console.error("Error in getRecommendedJobs:", err);
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
      .populate("clientId", "firstName lastName email profileImage");

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
// ===================
// Invite Freelancer to Job
// ===================
export const inviteFreelancer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Job ID
    const { freelancerId } = req.body;
    // @ts-ignore
    const clientId = req.user?._id || req.user?.id;

    if (!clientId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!freelancerId) {
      return res.status(400).json({ success: false, message: "Freelancer ID is required" });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.clientId.toString() !== clientId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: You do not own this job" });
    }

    if (job.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "You cannot invite freelancers until your job has been approved by admin.",
      });
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ success: false, message: "Freelancer not found" });
    }

    // Check if already invited
    const existingInvite = await Notification.findOne({

      userId: freelancerId,
      type: "job_invite",
      relatedId: job._id
    });

    if (existingInvite) {
      return res.status(400).json({ success: false, message: "Freelancer already invited to this job" });
    }

    // Create Notification
    await Notification.create({
      userId: freelancerId,
      type: "job_invite",
      title: "Job Invitation",
      message: `You have been invited to apply for "${job.title}"`,
      relatedId: job._id,
      relatedType: "job",
      link: `/jobs/${job._id}`,
      isRead: false
    });

    // Send Email
    try {
      const emailHtml = getBaseTemplate({

        title: "You're Invited! 🚀",
        subject: `Invitation to apply for ${job.title}`,
        content: `
          <p>Hi ${freelancer.firstName},</p>
          <p>You've been invited to apply for the job <strong>${job.title}</strong>.</p>
          <p>The client thinks you'd be a great fit!</p>
        `,
        actionUrl: `${process.env.CLIENT_URL || 'https://app.myconnecta.ng'}/jobs/${job._id}`,
        actionText: "View Job"
      });

      await sendEmail(freelancer.email, `Invitation: ${job.title}`, emailHtml);
    } catch (emailErr) {
      console.error("Failed to send invitation email:", emailErr);
    }

    res.status(200).json({ success: true, message: "Invitation sent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};
