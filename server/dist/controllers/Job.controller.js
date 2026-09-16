import mongoose from "mongoose";
import { Job } from "../models/Job.model.js";
import Profile from "../models/Profile.model.js";
import Proposal from "../models/Proposal.model.js";
import { createFeedPost } from '../services/feed.service.js';
// Get Jobs for Current Client
export const getClientJobs = async (req, res) => {
    try {
        const rawId = req.user?.id || req.user?._id || req.user?.userId;
        if (!rawId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        const clientObjectId = mongoose.Types.ObjectId.isValid(rawId) ? new mongoose.Types.ObjectId(rawId) : rawId;
        const jobs = await Job.find({
            $or: [
                { clientId: clientObjectId },
                { clientId: String(rawId) }
            ]
        })
            .sort({ createdAt: -1 })
            .populate("clientId", "firstName lastName email profileImage companyName")
            .lean();
        const jobsWithCounts = await Promise.all(jobs.map(async (j) => {
            const count = await Proposal.countDocuments({ jobId: j._id });
            return {
                ...j,
                proposalsCount: count,
                proposalCount: count,
                id: j._id,
            };
        }));
        return res.status(200).json({ success: true, data: jobsWithCounts, count: jobsWithCounts.length });
    }
    catch (err) {
        console.error("Get client jobs error:", err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
// Get All Jobs (with filtering for matching)
export const getAllJobs = async (req, res) => {
    try {
        const { category, skills, search, status = "active", limit = 20, page = 1, skip, hideApplied } = req.query;
        const filter = {};
        if (status && status !== 'all')
            filter.status = status;
        if (category && category !== 'All') {
            filter.category = new RegExp(category, 'i');
        }
        if (skills)
            filter.skills = { $in: skills.split(",") };
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { skills: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        // Determine applied state if user is logged in
        const rawUserId = req.user?.id || req.user?._id || req.user?.userId;
        let appliedJobSet = new Set();
        if (rawUserId) {
            const uObjectId = mongoose.Types.ObjectId.isValid(rawUserId) ? new mongoose.Types.ObjectId(rawUserId) : rawUserId;
            const appliedProposals = await Proposal.find({
                $or: [{ freelancerId: uObjectId }, { freelancerId: String(rawUserId) }]
            }).select("jobId").lean();
            appliedJobSet = new Set(appliedProposals.map((p) => String(p.jobId)));
            if (hideApplied === 'true' && appliedJobSet.size > 0) {
                filter._id = { $nin: Array.from(appliedJobSet).map(id => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id) };
            }
        }
        const calculatedSkip = skip ? Number(skip) : (Number(page) - 1) * Number(limit);
        const totalJobs = await Job.countDocuments(filter);
        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .skip(calculatedSkip)
            .limit(Number(limit))
            .populate("clientId", "firstName lastName email profileImage companyName");
        const jobsWithCounts = await Promise.all(jobs.map(async (j) => {
            const count = await Proposal.countDocuments({ jobId: j._id });
            const hasApplied = appliedJobSet.has(String(j._id));
            return {
                ...j.toObject(),
                proposalsCount: count,
                proposalCount: count,
                hasApplied,
                isApplied: hasApplied,
            };
        }));
        res.status(200).json({ success: true, data: jobsWithCounts, total: totalJobs, page: Number(page), limit: Number(limit) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message || err });
    }
};
// Admin: Get ALL jobs (no status filter)
export const getAllJobsAdmin = async (req, res) => {
    try {
        const { status, search, limit = 50, page = 1, isExternal, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const filter = {};
        if (status && status !== 'all')
            filter.status = status;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (isExternal !== undefined) {
            filter.isExternal = isExternal === 'true';
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const [jobs, total] = await Promise.all([
            Job.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .populate('clientId', 'firstName lastName email profileImage'),
            Job.countDocuments(filter),
        ]);
        res.status(200).json({ success: true, data: jobs, total, page: Number(page), limit: Number(limit) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
// Admin/Public Search Jobs
export const searchJobs = async (req, res) => {
    try {
        const { q, limit = 50 } = req.query;
        if (!q) {
            return res.status(200).json({ success: true, data: [] });
        }
        const filter = {
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } },
            ]
        };
        const rawUserId = req.user?.id || req.user?._id || req.user?.userId;
        let appliedJobSet = new Set();
        if (rawUserId) {
            const uObjectId = mongoose.Types.ObjectId.isValid(rawUserId) ? new mongoose.Types.ObjectId(rawUserId) : rawUserId;
            const appliedProposals = await Proposal.find({
                $or: [{ freelancerId: uObjectId }, { freelancerId: String(rawUserId) }]
            }).select("jobId").lean();
            appliedJobSet = new Set(appliedProposals.map((p) => String(p.jobId)));
        }
        const jobs = await Job.find(filter)
            .limit(Number(limit))
            .populate('clientId', 'firstName lastName email profileImage companyName');
        const jobsWithApplied = jobs.map((j) => {
            const hasApplied = appliedJobSet.has(String(j._id));
            return {
                ...j.toObject(),
                hasApplied,
                isApplied: hasApplied,
            };
        });
        res.status(200).json({ success: true, data: jobsWithApplied });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message || err });
    }
};
export const getMatchedJobs = async (req, res) => {
    try {
        const rawUserId = req.user?.id || req.user?._id || req.user?.userId;
        const uObjectId = mongoose.Types.ObjectId.isValid(rawUserId) ? new mongoose.Types.ObjectId(rawUserId) : rawUserId;
        const profile = await Profile.findOne({
            $or: [{ user: uObjectId }, { user: String(rawUserId) }]
        });
        if (!profile) {
            return res.status(200).json({ success: true, data: [] });
        }
        const { primarySkill, subSkills } = profile;
        const allSkills = [primarySkill, ...(subSkills || [])].filter(Boolean);
        const filter = {
            status: "active",
            $or: [
                { skills: { $in: allSkills } },
                { category: primarySkill }
            ]
        };
        let appliedJobSet = new Set();
        if (rawUserId) {
            const appliedProposals = await Proposal.find({
                $or: [{ freelancerId: uObjectId }, { freelancerId: String(rawUserId) }]
            }).select("jobId").lean();
            appliedJobSet = new Set(appliedProposals.map((p) => String(p.jobId)));
        }
        const { limit = 20, skip = 0 } = req.query;
        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit))
            .populate("clientId", "firstName lastName email profileImage companyName");
        const jobsWithApplied = jobs.map((j) => {
            const hasApplied = appliedJobSet.has(String(j._id));
            return {
                ...j.toObject(),
                hasApplied,
                isApplied: hasApplied,
            };
        });
        res.status(200).json({ success: true, data: jobsWithApplied });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message || err });
    }
};
// Get Job by ID
export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findById(id).populate("clientId", "firstName lastName email profileImage companyName");
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        let hasApplied = false;
        let userProposal = null;
        const rawUserId = req.user?.id || req.user?._id || req.user?.userId;
        if (rawUserId) {
            const uObjectId = mongoose.Types.ObjectId.isValid(rawUserId) ? new mongoose.Types.ObjectId(rawUserId) : rawUserId;
            userProposal = await Proposal.findOne({
                jobId: job._id,
                $or: [{ freelancerId: uObjectId }, { freelancerId: String(rawUserId) }]
            }).lean();
            if (userProposal) {
                hasApplied = true;
            }
        }
        const proposalsCount = await Proposal.countDocuments({ jobId: job._id });
        return res.status(200).json({
            success: true,
            data: {
                ...job.toObject(),
                hasApplied,
                isApplied: hasApplied,
                userProposal,
                proposalsCount,
                proposalCount: proposalsCount
            }
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Server error", error: err.message || err });
    }
};
// Create Job
export const createJob = async (req, res) => {
    try {
        const rawId = req.user?.id || req.user?._id || req.user?.userId;
        if (!rawId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        const clientId = mongoose.Types.ObjectId.isValid(rawId) ? new mongoose.Types.ObjectId(rawId) : rawId;
        let companyName = req.body.company;
        if (!companyName) {
            try {
                const userDoc = await (await import("../models/user.model.js")).default.findById(clientId).select("companyName firstName lastName").lean();
                companyName = userDoc?.companyName || (userDoc?.firstName ? `${userDoc.firstName} ${userDoc.lastName || ''}`.trim() : '');
            }
            catch { }
        }
        const { title, description, budget, duration, category, skills, jobType, locationType, budgetType, requirements, requireAiInterview, status, isExternal, location, monthlySalaryAmount, currency, probationPeriodDays, noticePeriodDays, benefitsSummary } = req.body;
        const newJob = await Job.create({
            title,
            description,
            budget: Number(budget || 0),
            duration: Number(duration || 30),
            category: category || 'General',
            skills: skills || [],
            clientId,
            jobType: jobType || 'milestone_gig',
            locationType: locationType || 'remote',
            budgetType: budgetType || 'fixed',
            requirements: requirements || [],
            requireAiInterview: requireAiInterview === true || requireAiInterview === 'true',
            status: status || "active",
            isExternal: isExternal || false,
            company: companyName || '',
            location: location || 'Remote',
            openings: Number(req.body.openings || 1),
            monthlySalaryAmount: monthlySalaryAmount || (jobType === 'full_time_contract' ? budget : undefined),
            currency: currency || 'USD',
            probationPeriodDays: probationPeriodDays ? Number(probationPeriodDays) : 30,
            noticePeriodDays: noticePeriodDays ? Number(noticePeriodDays) : 30,
            benefitsSummary: benefitsSummary || '',
            paymentStatus: 'pending',
            paymentVerified: false
        });
        // Notify Matched Freelancers
        try {
            const { notifyMatchedFreelancers } = await import('./notification.controller.js');
            await notifyMatchedFreelancers(newJob);
        }
        catch (err) {
            console.error('Failed to notify matched freelancers:', err);
        }
        createFeedPost({
            type: 'job_posted',
            emoji: '📢',
            title: `New Job: ${title}`,
            body: `A new ${jobType || 'freelance'} job has been posted — ${title}. Budget: ₦${budget}. Skills needed: ${(skills || []).slice(0, 3).join(', ')}.`,
            relatedType: 'job',
            relatedId: newJob._id?.toString(),
            targetAudience: 'freelancers',
        });
        res.status(201).json({ success: true, data: newJob });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
// Bulk Create Jobs
export const bulkCreateJobs = async (req, res) => {
    try {
        const clientId = req.user?._id;
        const { jobs } = req.body;
        if (!Array.isArray(jobs)) {
            return res.status(400).json({ success: false, message: "Jobs must be an array" });
        }
        const jobsToCreate = jobs.map((job) => ({
            ...job,
            clientId: job.clientId || clientId,
            status: job.status || "active",
            isExternal: job.isExternal || false,
        }));
        const createdJobs = await Job.insertMany(jobsToCreate);
        res.status(201).json({
            success: true,
            message: `${createdJobs.length} jobs created successfully`,
            data: createdJobs
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
// Update Job
export const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const rawId = req.user?.id || req.user?._id || req.user?.userId;
        const userRole = req.user?.role || req.user?.userType;
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        // Ownership check: only owner or admin can update
        const isOwner = rawId && job.clientId && job.clientId.toString() === rawId.toString();
        const isAdmin = userRole === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized: You do not own this job listing" });
        }
        // Disallow altering ownership (clientId)
        const updateData = { ...req.body };
        delete updateData.clientId;
        const updatedJob = await Job.findByIdAndUpdate(id, updateData, { new: true });
        return res.status(200).json({ success: true, data: updatedJob });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
// Delete Job
export const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const rawId = req.user?.id || req.user?._id || req.user?.userId;
        const userRole = req.user?.role || req.user?.userType;
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        // Ownership check: only owner or admin can delete
        const isOwner = rawId && job.clientId && job.clientId.toString() === rawId.toString();
        const isAdmin = userRole === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized: You do not own this job listing" });
        }
        await Job.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Job deleted successfully" });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
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
