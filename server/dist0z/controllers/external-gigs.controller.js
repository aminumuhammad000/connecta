"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllExternalGigs = exports.deleteExternalGig = exports.createOrUpdateExternalGig = void 0;
const Job_model_1 = __importDefault(require("../models/Job.model"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Create or update an external gig
 */
const createOrUpdateExternalGig = async (req, res) => {
    try {
        const { external_id, source, title, company, location, locationType = "remote", job_type, jobScope = "local", description, apply_url, posted_at, skills = [], category, niche, experience = "Any", deadline, duration, durationType = "months", budget, } = req.body;
        // Validation
        if (!external_id || !source || !title || !company || !description || !apply_url || !category) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: external_id, source, title, company, description, apply_url, category",
            });
        }
        // Find a system user or admin to assign these gigs to
        // This prevents 500 errors due to missing user reference
        let systemUserId = new mongoose_1.default.Types.ObjectId("000000000000000000000000");
        // Try to find an existing admin or system user
        const User = mongoose_1.default.model("User");
        const systemUser = await User.findOne({
            $or: [{ email: "system@connecta.ng" }, { userType: "admin" }]
        });
        if (systemUser) {
            systemUserId = systemUser._id;
        }
        else {
            // Create a system user if none exists (rare case)
            try {
                const newSystemUser = await User.create({
                    firstName: "System",
                    lastName: "Scraper",
                    email: "system@connecta.ng",
                    password: "system_password_secure_hash", // Placeholder
                    userType: "admin",
                    isVerified: true
                });
                systemUserId = newSystemUser._id;
            }
            catch (e) {
                console.warn("Could not create system user, using default ID");
            }
        }
        // Check if external gig already exists
        const existingGig = await Job_model_1.default.findOne({
            isExternal: true,
            source,
            externalId: external_id,
        });
        const now = new Date().toISOString();
        if (existingGig) {
            // Update existing gig and update lastScrapedAt
            existingGig.title = title;
            existingGig.company = company;
            existingGig.location = location;
            existingGig.locationType = locationType;
            existingGig.jobType = job_type || "full-time";
            existingGig.jobScope = jobScope;
            existingGig.description = description;
            existingGig.applyUrl = apply_url;
            existingGig.skills = skills;
            existingGig.category = category;
            existingGig.niche = niche;
            existingGig.experience = experience;
            existingGig.posted = posted_at ? new Date(posted_at) : existingGig.posted;
            existingGig.deadline = deadline ? new Date(deadline) : existingGig.deadline;
            existingGig.duration = duration;
            existingGig.durationType = durationType;
            existingGig.budget = budget;
            // Update metadata - track when this job was last seen
            existingGig.lastScrapedAt = now;
            await existingGig.save();
            return res.status(200).json({
                success: true,
                message: "External gig updated successfully",
                data: existingGig,
            });
        }
        // Create new external gig with all fields matching client posting flow
        const newGig = await Job_model_1.default.create({
            title,
            company,
            location,
            locationType: locationType,
            jobType: job_type || "full-time",
            jobScope: jobScope,
            description,
            skills,
            experience: experience,
            category,
            niche,
            clientId: systemUserId,
            isExternal: true, // CRITICAL: Mark as external
            externalId: external_id,
            source,
            applyUrl: apply_url,
            posted: posted_at ? new Date(posted_at) : new Date(),
            deadline: deadline ? new Date(deadline) : undefined,
            duration,
            durationType,
            budget,
            status: "active",
            // Add metadata for 14-day deletion policy
            firstScrapedAt: now,
            lastScrapedAt: now,
        });
        res.status(201).json({
            success: true,
            message: "External gig created successfully",
            data: newGig,
        });
    }
    catch (error) {
        console.error("Error creating/updating external gig:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
exports.createOrUpdateExternalGig = createOrUpdateExternalGig;
/**
 * Delete an external gig by externalId
 */
const deleteExternalGig = async (req, res) => {
    try {
        const { source, externalId } = req.params;
        if (!source || !externalId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: source and externalId",
            });
        }
        const deletedGig = await Job_model_1.default.findOneAndDelete({
            isExternal: true,
            source,
            externalId,
        });
        if (!deletedGig) {
            return res.status(404).json({
                success: false,
                message: "External gig not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "External gig deleted successfully",
            data: deletedGig,
        });
    }
    catch (error) {
        console.error("Error deleting external gig:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
exports.deleteExternalGig = deleteExternalGig;
/**
 * Get all external gigs (optional - for debugging)
 */
const getAllExternalGigs = async (req, res) => {
    try {
        const { source, limit = 50 } = req.query;
        const filter = { isExternal: true };
        if (source)
            filter.source = source;
        const gigs = await Job_model_1.default.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit));
        res.status(200).json({
            success: true,
            count: gigs.length,
            data: gigs,
        });
    }
    catch (error) {
        console.error("Error fetching external gigs:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
exports.getAllExternalGigs = getAllExternalGigs;
