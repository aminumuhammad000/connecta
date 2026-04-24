import { Job } from "../models/Job.model.js";
import Profile from "../models/Profile.model.js";
import Proposal from "../models/Proposal.model.js";
// Get Jobs for Current Client
export const getClientJobs = async (req, res) => {
    try {
        const clientId = req.user?._id;
        const jobs = await Job.find({ clientId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: jobs });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
// Get All Jobs (with filtering for matching)
export const getAllJobs = async (req, res) => {
    try {
        const { category, skills, status = "active" } = req.query;
        const filter = { status };
        if (category)
            filter.category = category;
        if (skills)
            filter.skills = { $in: skills.split(",") };
        // EXCLUDE APPLIED JOBS: If user is logged in, hide jobs they already applied to
        const userId = req.user?._id;
        if (userId) {
            const appliedJobIds = await Proposal.find({ freelancerId: userId }).distinct("jobId");
            if (appliedJobIds.length > 0) {
                filter._id = { $nin: appliedJobIds };
            }
        }
        const { limit = 20, skip = 0 } = req.query;
        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit))
            .populate("clientId", "firstName lastName email profileImage");
        res.status(200).json({ success: true, data: jobs });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
// Get Matched Jobs for Freelancer
export const getMatchedJobs = async (req, res) => {
    try {
        const userId = req.user?._id;
        const profile = await Profile.findOne({ user: userId });
        if (!profile) {
            return res.status(200).json({ success: true, data: [] });
        }
        const { primarySkill, subSkills } = profile;
        const allSkills = [primarySkill, ...subSkills];
        const filter = {
            status: "active",
            $or: [
                { skills: { $in: allSkills } },
                { category: primarySkill }
            ]
        };
        // EXCLUDE APPLIED JOBS: Hide jobs they already applied to
        const appliedJobIds = await Proposal.find({ freelancerId: userId }).distinct("jobId");
        if (appliedJobIds.length > 0) {
            filter._id = { $nin: appliedJobIds };
        }
        const { limit = 20, skip = 0 } = req.query;
        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit))
            .populate("clientId", "firstName lastName email profileImage");
        res.status(200).json({ success: true, data: jobs });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
// Get Job by ID
export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findById(id).populate("clientId", "firstName lastName email profileImage");
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        res.status(200).json({ success: true, data: job });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
// Create Job
export const createJob = async (req, res) => {
    try {
        const clientId = req.user?._id;
        const { title, description, budget, duration, category, skills } = req.body;
        const newJob = await Job.create({
            title,
            description,
            budget,
            duration,
            category,
            skills,
            clientId,
            status: "active" // Defaulting to active for simple flow
        });
        // Notify Matched Freelancers
        try {
            const { notifyMatchedFreelancers } = await import('./notification.controller.js');
            await notifyMatchedFreelancers(newJob);
        }
        catch (err) {
            console.error('Failed to notify matched freelancers:', err);
        }
        res.status(201).json({ success: true, data: newJob });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
// Update Job
export const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedJob });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
// Delete Job
export const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        await Job.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Job deleted" });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
// Update Job Status
export const updateJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedJob = await Job.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ success: true, data: updatedJob });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
