import { Request, Response } from "express";
import Job from "../models/Job.model";
import mongoose from "mongoose";

/**
 * Create or update an external gig
 */
export const createOrUpdateExternalGig = async (req: Request, res: Response) => {
    try {
        const {
            external_id,
            source,
            title,
            company,
            location,
            job_type,
            description,
            apply_url,
            posted_at,
            skills = [],
            category = "General",
        } = req.body;

        // Validation
        if (!external_id || !source || !title || !company || !description || !apply_url) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: external_id, source, title, company, description, apply_url",
            });
        }

        // Create a system user ID for external gigs (or use a dedicated external system account)
        // For now, we'll use a fixed ObjectId - you should create a dedicated "System" user
        const systemUserId = new mongoose.Types.ObjectId("000000000000000000000000");

        // Check if external gig already exists
        const existingGig = await Job.findOne({
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

            await existingGig.save();

            return res.status(200).json({
                success: true,
                message: "External gig updated successfully",
                data: existingGig,
            });
        }

        // Create new external gig
        const newGig = await Job.create({
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
            status: "active",
        });

        res.status(201).json({
            success: true,
            message: "External gig created successfully",
            data: newGig,
        });
    } catch (error: any) {
        console.error("Error creating/updating external gig:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

/**
 * Delete an external gig by externalId
 */
export const deleteExternalGig = async (req: Request, res: Response) => {
    try {
        const { source, externalId } = req.params;

        if (!source || !externalId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: source and externalId",
            });
        }

        const deletedGig = await Job.findOneAndDelete({
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
    } catch (error: any) {
        console.error("Error deleting external gig:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

/**
 * Get all external gigs (optional - for debugging)
 */
export const getAllExternalGigs = async (req: Request, res: Response) => {
    try {
        const { source, limit = 50 } = req.query;

        const filter: any = { isExternal: true };
        if (source) filter.source = source;

        const gigs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            count: gigs.length,
            data: gigs,
        });
    } catch (error: any) {
        console.error("Error fetching external gigs:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
