"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPortfolioItems = exports.deletePortfolioItem = exports.addPortfolioItem = void 0;
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
/**
 * Add a portfolio item
 */
const addPortfolioItem = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { title, description, imageUrl, projectUrl, tags } = req.body;
        if (!title || !description || !imageUrl) {
            return res.status(400).json({ success: false, message: 'Title, description, and image are required' });
        }
        const profile = await Profile_model_1.default.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        const newItem = {
            title,
            description,
            imageUrl,
            projectUrl,
            tags: tags || [],
        };
        profile.portfolio.push(newItem);
        await profile.save();
        return res.status(201).json({
            success: true,
            message: 'Portfolio item added successfully',
            data: profile.portfolio[profile.portfolio.length - 1],
        });
    }
    catch (error) {
        console.error('Add portfolio error:', error);
        return res.status(500).json({ success: false, message: 'Failed to add portfolio item' });
    }
};
exports.addPortfolioItem = addPortfolioItem;
/**
 * Delete a portfolio item
 */
const deletePortfolioItem = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { id } = req.params;
        const profile = await Profile_model_1.default.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        // Filter out the item
        profile.portfolio = profile.portfolio.filter((item) => item._id.toString() !== id);
        await profile.save();
        return res.status(200).json({
            success: true,
            message: 'Portfolio item deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete portfolio error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete portfolio item' });
    }
};
exports.deletePortfolioItem = deletePortfolioItem;
/**
 * Get portfolio items (public or private)
 */
const getPortfolioItems = async (req, res) => {
    try {
        const { userId } = req.params; // Can pass userId to view others' portfolio
        const targetId = userId || req.user?.id || req.user?._id;
        if (!targetId) {
            return res.status(400).json({ success: false, message: 'User ID required' });
        }
        const profile = await Profile_model_1.default.findOne({ user: targetId });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        return res.status(200).json({
            success: true,
            data: profile.portfolio,
        });
    }
    catch (error) {
        console.error('Get portfolio error:', error);
        return res.status(500).json({ success: false, message: 'Failed to get portfolio items' });
    }
};
exports.getPortfolioItems = getPortfolioItems;
