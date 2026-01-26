import { Request, Response } from "express";
import { Job } from "../models/Job.model.js";
import Profile from "../models/Profile.model.js";

export const getMatchedGigs = async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req as any).user?._id;
    if (!userId) return res.status(400).json({ success: false, message: "UserId required" });

    const profile = await Profile.findOne({ user: userId });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    const profileSkills = profile.skills || [];
    const userCategories = profile.jobCategories || [];
    const userTitle = profile.jobTitle?.toLowerCase() || "";
    const userEngagementTypes = (profile.engagementTypes || []).map(t => t.toLowerCase());
    const minSalary = profile.minimumSalary || 0;

    // Initial filter: Match by skills or categories or title
    const filter: any = {
      status: "active",
      $or: [
        { skills: { $in: profileSkills } },
        { category: { $in: userCategories } },
        { title: { $regex: userTitle || "", $options: "i" } }
      ]
    };

    // Remote preference filter
    if (profile.remoteWorkType === 'remote_only') {
      filter.locationType = 'remote';
    } else if (profile.remoteWorkType === 'hybrid') {
      filter.locationType = { $in: ['hybrid', 'remote'] };
    }

    let jobs = await Job.find(filter)
      .sort({ isExternal: 1, posted: -1 })
      .limit(50)
      .populate("clientId", "firstName lastName email");

    // Scoring logic
    const scoredJobs = jobs.map((job) => {
      let score = 0;

      // 1. Skill Match
      if (job.skills && job.skills.length > 0) {
        let matchCount = 0;
        job.skills.forEach(s => {
          if (profileSkills.includes(s)) matchCount++;
        });
        score += (matchCount / Math.max(job.skills.length, 1)) * 1.0;
      }

      // 2. Category Match
      if (job.category && userCategories.includes(job.category)) {
        score += 0.5;
      }

      // 3. Title Match
      if (userTitle && job.title.toLowerCase().includes(userTitle)) {
        score += 0.8;
      }

      // 4. Engagement Type Match
      if (job.jobType && userEngagementTypes.includes(job.jobType.toLowerCase())) {
        score += 0.4;
      }

      // 5. Salary Match
      if (minSalary > 0 && job.salary?.min && job.salary.min >= minSalary) {
        score += 0.3;
      }

      // 6. Prioritize Internal Jobs
      if (!job.isExternal) {
        score += 2.0;
      }

      return { job, score };
    });

    scoredJobs.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      data: scoredJobs.map(item => item.job)
    });
  } catch (err: any) {
    console.error("Error in getMatchedGigs:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const applyToGig = async (req: Request, res: Response) => {
  try {
    const { gigId, userId, coverLetter, message } = req.body;
    // Create application record, send notifications, etc.
    res.json({ success: true, data: { applied: true, gigId } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const saveGig = async (req: Request, res: Response) => {
  try {
    const { gigId, userId } = req.body;
    // Save logic
    res.json({ success: true, data: { saved: true, gigId } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSavedGigs = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    // fetch saved gigs
    res.json({ success: true, data: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const trackApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    // fetch applications
    res.json({ success: true, data: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecommendedGigs = async (req: Request, res: Response) => {
  try {
    // more advanced ML recs
    res.json({ success: true, data: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
