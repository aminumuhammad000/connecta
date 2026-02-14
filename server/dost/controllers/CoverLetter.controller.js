import LLMService from '../services/LLM.service.js';
import User from '../models/user.model.js';
import Profile from '../models/Profile.model.js';
export const generateCoverLetter = async (req, res) => {
    try {
        const { jobTitle, jobDesc, tone } = req.body;
        const userId = req.user.id;
        // Fetch User and Profile
        const user = await User.findById(userId);
        const profile = await Profile.findOne({ user: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Enforce spark balance requirement
        if ((user.sparks || 0) <= 0) {
            return res.status(403).json({
                success: false,
                message: 'You need Sparks to use AI services. Please claim your daily reward or complete your profile to earn sparks.'
            });
        }
        // Prepare details
        const freelancerName = `${user.firstName} ${user.lastName}`;
        const freelancerSkills = profile?.skills || [];
        const freelancerBio = profile?.bio || `I am a skilled ${jobTitle} looking for new opportunities.`;
        // If jobId is implied (user might pass jobTitle as ID sometimes, but usually title)
        // Ideally we might want jobId to fetch full desc, but passing desc directly uses less DB calls if context has it.
        // But for better quality, let's allow finding a job if needed. 
        // For now, trust the input.
        const coverLetter = await LLMService.generateCoverLetter(jobTitle || 'Freelance Role', jobDesc || 'A standard freelance project.', freelancerName, freelancerSkills, freelancerBio);
        console.log('✅ Generated Cover Letter:', coverLetter);
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
