
import express, { Request, Response } from 'express';
// import { requireAuth } from '@connecta/common'; // We need to export this from common
import { NotFoundError } from '@connecta/common';
import { Profile } from '../models/profile';

const router = express.Router();

// [GET] /me - Get current user's full profile
router.get('/me', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
        throw new NotFoundError();
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
        throw new NotFoundError();
    }

    res.status(200).send({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile
    });
});

// [GET] /:userId - Public profile view
router.get('/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    const profile = await Profile.findOne({ userId });

    if (!profile) {
        throw new NotFoundError();
    }

    // Sanitize for public view
    const publicProfile = {
        userId: profile.userId,
        role: profile.role,
        bio: profile.bio,
        skills: profile.skills,
        portfolio: profile.portfolio,
        hourlyRate: profile.hourlyRate,
        availabilityStatus: profile.availabilityStatus,
        website: profile.website,
        socialLinks: profile.socialLinks,
        certifications: profile.certifications,
        languages: profile.languages,
        location: profile.location,
        avatar: profile.avatar
    };

    res.status(200).send({
        success: true,
        message: 'Public profile retrieved successfully',
        data: publicProfile
    });
});

export { router as showProfileRouter };
