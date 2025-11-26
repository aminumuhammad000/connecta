"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchJobs = exports.getRecommendedJobs = exports.deleteJob = exports.updateJob = exports.createJob = exports.getJobById = exports.getAllJobs = exports.getClientJobs = void 0;
// ===================
// Get Jobs for Current Client
// ===================
const getClientJobs = async (req, res) => {
    try {
        // Use (req.user as any) to avoid TS errors
        const clientId = req.user?._id || req.user?.id;
        if (!clientId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const jobs = await Job_model_1.default.find({ clientId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: jobs });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
exports.getClientJobs = getClientJobs;
const Job_model_1 = __importDefault(require("../models/Job.model"));
// ===================
// Get All Jobs
// ===================
const getAllJobs = async (req, res) => {
    try {
        const { category, location, jobType, locationType, skills, limit = 10, page = 1 } = req.query;
        const filter = { status: "active" };
        if (category)
            filter.category = category;
        if (location)
            filter.location = { $regex: location, $options: "i" };
        if (jobType)
            filter.jobType = jobType;
        if (locationType)
            filter.locationType = locationType;
        if (skills)
            filter.skills = { $in: skills.split(",") };
        const skip = (Number(page) - 1) * Number(limit);
        const jobs = await Job_model_1.default.find(filter)
            .sort({ posted: -1 })
            .limit(Number(limit))
            .skip(skip)
            .populate("clientId", "firstName lastName email");
        const total = await Job_model_1.default.countDocuments(filter);
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
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
exports.getAllJobs = getAllJobs;
// ===================
// Get Job by ID
// ===================
const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job_model_1.default.findById(id).populate("clientId", "firstName lastName email");
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        res.status(200).json({ success: true, data: job });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
exports.getJobById = getJobById;
// ===================
// Create Job
// ===================
const createJob = async (req, res) => {
    try {
        const jobData = req.body;
        // Set clientId from authenticated user (use any to avoid TS error)
        const clientId = req.user?._id || req.user?.id;
        if (!clientId) {
            return res.status(401).json({ success: false, message: "Unauthorized: No clientId" });
        }
        jobData.clientId = clientId;
        const newJob = await Job_model_1.default.create(jobData);
        res.status(201).json({
            success: true,
            message: "Job created successfully",
            data: newJob,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
exports.createJob = createJob;
// ===================
// Update Job
// ===================
const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedJob = await Job_model_1.default.findByIdAndUpdate(id, updateData, {
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
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
exports.updateJob = updateJob;
// ===================
// Delete Job
// ===================
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedJob = await Job_model_1.default.findByIdAndDelete(id);
        if (!deletedJob) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        res.status(200).json({
            success: true,
            message: "Job deleted successfully",
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
exports.deleteJob = deleteJob;
// ===================
// Get Recommended Jobs (Jobs You May Like)
// ===================
const getRecommendedJobs = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        // Get active jobs, sorted by posted date
        const jobs = await Job_model_1.default.find({ status: "active" })
            .sort({ posted: -1 })
            .limit(Number(limit))
            .populate("clientId", "firstName lastName email");
        res.status(200).json({
            success: true,
            data: jobs,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
exports.getRecommendedJobs = getRecommendedJobs;
// ===================
// Search Jobs
// ===================
const searchJobs = async (req, res) => {
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
                { skills: { $in: [q] } },
                { company: { $regex: q, $options: "i" } },
            ],
        };
        const skip = (Number(page) - 1) * Number(limit);
        const jobs = await Job_model_1.default.find(filter)
            .sort({ posted: -1 })
            .limit(Number(limit))
            .skip(skip)
            .populate("clientId", "firstName lastName email");
        const total = await Job_model_1.default.countDocuments(filter);
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
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
exports.searchJobs = searchJobs;
