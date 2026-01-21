import Job from "../models/Job.model";
import Profile from "../models/Profile.model";
export const getMatchedGigs = async (req, res) => {
    try {
        const userId = req.query.userId;
        const profile = await Profile.findOne({ user: userId });
        if (!profile)
            return res.status(404).json({ success: false, message: "Profile not found" });
        const gigs = await Job.find({ skillsRequired: { $in: profile.skills || [] } }).limit(50);
        res.json({ success: true, data: gigs });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const applyToGig = async (req, res) => {
    try {
        const { gigId, userId, coverLetter, message } = req.body;
        // Create application record, send notifications, etc.
        res.json({ success: true, data: { applied: true, gigId } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const saveGig = async (req, res) => {
    try {
        const { gigId, userId } = req.body;
        // Save logic
        res.json({ success: true, data: { saved: true, gigId } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const getSavedGigs = async (req, res) => {
    try {
        const userId = req.query.userId;
        // fetch saved gigs
        res.json({ success: true, data: [] });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const trackApplications = async (req, res) => {
    try {
        const userId = req.query.userId;
        // fetch applications
        res.json({ success: true, data: [] });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const getRecommendedGigs = async (req, res) => {
    try {
        // more advanced ML recs
        res.json({ success: true, data: [] });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
