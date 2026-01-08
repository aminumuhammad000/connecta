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
        const { external_id, source, title, company, location, job_type, description, apply_url, posted_at, skills = [], category = "General", deadline, } = req.body;
        // Validation
        if (!external_id || !source || !title || !company || !description || !apply_url) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: external_id, source, title, company, description, apply_url",
            });
        }
        // Create a system user ID for external gigs (or use a dedicated external system account)
        // For now, we'll use a fixed ObjectId - you should create a dedicated "System" user
        const systemUserId = new mongoose_1.default.Types.ObjectId("000000000000000000000000");
        // Check if external gig already exists
        const existingGig = await Job_model_1.default.findOne({
            isExternal: true,
            source,
            externalId: external_id,
        });
        if (existingGig) {
            // Update existing gig
            existingGig.title = title;
            existingGig.company = company;
            existingGig.location = location;
            existingGig.jobType = job_type || "full-time";
            existingGig.description = description;
            existingGig.applyUrl = apply_url;
            existingGig.skills = skills;
            existingGig.category = category;
            existingGig.posted = posted_at ? new Date(posted_at) : existingGig.posted;
            existingGig.deadline = deadline ? new Date(deadline) : existingGig.deadline;
            await existingGig.save();
            return res.status(200).json({
                success: true,
                message: "External gig updated successfully",
                data: existingGig,
            });
        }
        // Create new external gig
        const newGig = await Job_model_1.default.create({
            title,
            company,
            location,
            locationType: "remote", // Default for external gigs
            jobType: job_type || "full-time",
            description,
            skills,
            experience: "Any", // Default
            category,
            clientId: systemUserId,
            isExternal: true,
            externalId: external_id,
            source,
            applyUrl: apply_url,
            posted: posted_at ? new Date(posted_at) : new Date(),
            deadline: deadline ? new Date(deadline) : undefined,
            status: "active",
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
