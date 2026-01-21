"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCoverLetter = void 0;
const LLM_service_1 = __importDefault(require("../services/LLM.service"));
const user_model_1 = __importDefault(require("../models/user.model"));
const generateCoverLetter = async (req, res) => {
    try {
        const { jobTitle, jobDesc, tone } = req.body;
        const userId = req.user.id;
        // Fetch User Profile
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Prepare details
        const freelancerName = `${user.firstName} ${user.lastName}`;
        const freelancerSkills = user.skills || [];
        const freelancerBio = user.bio || '';
        // If jobId is implied (user might pass jobTitle as ID sometimes, but usually title)
        // Ideally we might want jobId to fetch full desc, but passing desc directly uses less DB calls if context has it.
        // But for better quality, let's allow finding a job if needed. 
        // For now, trust the input.
        const coverLetter = await LLM_service_1.default.generateCoverLetter(jobTitle || 'Freelance Role', jobDesc || 'A standard freelance project.', freelancerName, freelancerSkills, freelancerBio);
        res.status(200).json({
            success: true,
            data: coverLetter
        });
    }
    catch (error) {
        console.error('Error generating cover letter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate cover letter',
            error: error.message
        });
    }
};
exports.generateCoverLetter = generateCoverLetter;
