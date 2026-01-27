import { Request, Response } from 'express';
import Profile from '../models/Profile.model.js';
import User from '../models/user.model.js';

/**
 * Upload a portfolio image to Cloudinary
 */
export const uploadPortfolioImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            console.log('❌ Portfolio Upload: No file in request');
            console.log('Request Headers:', req.headers);
            console.log('Request Body:', req.body);
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const imageUrl = (req.file as any).path;

        return res.status(200).json({
            success: true,
            message: 'Portfolio image uploaded successfully',
            data: {
                url: imageUrl
            }
        });
    } catch (error: any) {
        console.error('Portfolio Upload Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to upload portfolio image', error: error.message });
    }
};

/**
 * Add a portfolio item
 */
export const addPortfolioItem = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
        const { title, description, imageUrl, projectUrl, tags } = req.body;

        if (!title || !description || !imageUrl) {
            return res.status(400).json({ success: false, message: 'Title, description, and image are required' });
        }

        const profile = await Profile.findOne({ user: userId });

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

        profile.portfolio.push(newItem as any);
        await profile.save();

        return res.status(201).json({
            success: true,
            message: 'Portfolio item added successfully',
            data: profile.portfolio[profile.portfolio.length - 1],
        });
    } catch (error: any) {
        console.error('Add portfolio error:', error);
        return res.status(500).json({ success: false, message: 'Failed to add portfolio item' });
    }
};

/**
 * Delete a portfolio item
 */
export const deletePortfolioItem = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
        const { id } = req.params;

        const profile = await Profile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        // Filter out the item
        profile.portfolio = profile.portfolio.filter((item: any) => item._id.toString() !== id) as any;
        await profile.save();

        return res.status(200).json({
            success: true,
            message: 'Portfolio item deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete portfolio error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete portfolio item' });
    }
};

/**
 * Get portfolio items (public or private)
 */
export const getPortfolioItems = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params; // Can pass userId to view others' portfolio
        const targetId = userId || (req as any).user?.id || (req as any).user?._id;

        if (!targetId) {
            return res.status(400).json({ success: false, message: 'User ID required' });
        }

        const profile = await Profile.findOne({ user: targetId });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        return res.status(200).json({
            success: true,
            data: profile.portfolio,
        });
    } catch (error: any) {
        console.error('Get portfolio error:', error);
        return res.status(500).json({ success: false, message: 'Failed to get portfolio items' });
    }
};
