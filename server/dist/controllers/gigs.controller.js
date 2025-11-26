"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendedGigs = exports.trackApplications = exports.getSavedGigs = exports.saveGig = exports.applyToGig = exports.getMatchedGigs = void 0;
const Job_model_1 = __importDefault(require("../models/Job.model"));
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const getMatchedGigs = async (req, res) => {
    try {
        const userId = req.query.userId;
        const profile = await Profile_model_1.default.findOne({ user: userId });
        if (!profile)
            return res.status(404).json({ success: false, message: "Profile not found" });
        const gigs = await Job_model_1.default.find({ skillsRequired: { $in: profile.skills || [] } }).limit(50);
        res.json({ success: true, data: gigs });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getMatchedGigs = getMatchedGigs;
const applyToGig = async (req, res) => {
    try {
        const { gigId, userId, coverLetter, message } = req.body;
        // Create application record, send notifications, etc.
        res.json({ success: true, data: { applied: true, gigId } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.applyToGig = applyToGig;
const saveGig = async (req, res) => {
    try {
        const { gigId, userId } = req.body;
        // Save logic
        res.json({ success: true, data: { saved: true, gigId } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.saveGig = saveGig;
const getSavedGigs = async (req, res) => {
    try {
        const userId = req.query.userId;
        // fetch saved gigs
        res.json({ success: true, data: [] });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getSavedGigs = getSavedGigs;
const trackApplications = async (req, res) => {
    try {
        const userId = req.query.userId;
        // fetch applications
        res.json({ success: true, data: [] });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.trackApplications = trackApplications;
const getRecommendedGigs = async (req, res) => {
    try {
        // more advanced ML recs
        res.json({ success: true, data: [] });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getRecommendedGigs = getRecommendedGigs;
