"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobValidatorService = void 0;
const logger_1 = require("../utils/logger");
/**
 * Job Validator Service
 * Validates each job before adding to the database
 */
class JobValidatorService {
    /**
     * Validate a single job
     * Returns true if the job passes all validation checks
     */
    validate(gig) {
        const errors = [];
        // 1. Required Fields Validation
        if (!gig.title || gig.title.trim().length === 0) {
            errors.push("Title is required and cannot be empty");
        }
        if (!gig.company || gig.company.trim().length === 0) {
            errors.push("Company name is required and cannot be empty");
        }
        if (!gig.description || gig.description.trim().length < 20) {
            errors.push("Description must be at least 20 characters long");
        }
        if (!gig.apply_url || !this.isValidUrl(gig.apply_url)) {
            errors.push("Valid apply URL is required");
        }
        if (!gig.external_id || gig.external_id.trim().length === 0) {
            errors.push("External ID is required");
        }
        if (!gig.source || gig.source.trim().length === 0) {
            errors.push("Source is required");
        }
        // 2. Content Quality Validation
        if (this.containsSpam(gig.title) || this.containsSpam(gig.description)) {
            errors.push("Content appears to be spam or low quality");
        }
        // 3. Date Validation
        if (gig.deadline) {
            const deadlineDate = new Date(gig.deadline);
            const now = new Date();
            if (isNaN(deadlineDate.getTime())) {
                errors.push("Invalid deadline date format");
            }
            else if (deadlineDate < now) {
                errors.push("Job deadline has already passed");
            }
        }
        // 4. URL Validation
        if (gig.apply_url && !this.isValidUrl(gig.apply_url)) {
            errors.push("Apply URL is not valid");
        }
        // 5. Category Validation (optional but recommended)
        if (gig.category && gig.category.trim().length === 0) {
            errors.push("Category cannot be empty if provided");
        }
        const isValid = errors.length === 0;
        if (!isValid) {
            logger_1.logger.warn(`❌ Job validation failed for "${gig.title}": ${errors.join(", ")}`);
        }
        else {
            logger_1.logger.debug(`✅ Job validation passed for "${gig.title}"`);
        }
        return { isValid, errors };
    }
    /**
     * Check if URL is valid
     */
    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === "http:" || urlObj.protocol === "https:";
        }
        catch {
            return false;
        }
    }
    /**
     * Detect spam or low-quality content
     */
    containsSpam(text) {
        const spamKeywords = [
            "click here now",
            "make money fast",
            "100% free",
            "act now",
            "limited time offer",
            "no experience needed earn $$$",
            "work from home earn thousands",
        ];
        const lowerText = text.toLowerCase();
        return spamKeywords.some(keyword => lowerText.includes(keyword));
    }
    /**
     * Batch validate multiple jobs
     */
    validateBatch(gigs) {
        const valid = [];
        const invalid = [];
        for (const gig of gigs) {
            const { isValid, errors } = this.validate(gig);
            if (isValid) {
                valid.push(gig);
            }
            else {
                invalid.push({ gig, errors });
            }
        }
        logger_1.logger.info(`✅ Validated ${valid.length}/${gigs.length} jobs successfully`);
        if (invalid.length > 0) {
            logger_1.logger.warn(`⚠️ ${invalid.length} jobs failed validation`);
        }
        return { valid, invalid };
    }
}
exports.JobValidatorService = JobValidatorService;
