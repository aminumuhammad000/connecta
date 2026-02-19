
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, BadRequestError } from '@connecta/common';
import { Profile } from '../models/profile';

const router = express.Router();

// [PUT] /me - General update
router.put('/me', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw new BadRequestError('User ID missing');

    const profile = await Profile.findOne({ userId });
    if (!profile) throw new NotFoundError();

    const updates = req.body;
    // Prevent sensitive fields from being updated here
    delete updates.userId;
    delete updates.email;
    delete updates.role;

    Object.assign(profile, updates);
    await profile.save();

    res.status(200).send({
        success: true,
        message: 'Profile updated successfully',
        data: profile
    });
});

// [PUT] /me/avatar
router.put('/me/avatar', [
    body('avatar').isURL().withMessage('Avatar must be a valid URL')
], async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const profile = await Profile.findOne({ userId });
    if (!profile) throw new NotFoundError();

    profile.avatar = req.body.avatar;
    await profile.save();

    res.status(200).send({
        success: true,
        message: 'Avatar updated successfully',
        data: { avatar: profile.avatar }
    });
});

// [PUT] /me/skills
router.put('/me/skills', [
    body('skills').isArray().withMessage('Skills must be an array')
], async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const profile = await Profile.findOne({ userId });
    if (!profile) throw new NotFoundError();

    profile.skills = req.body.skills;
    await profile.save();

    res.status(200).send({
        success: true,
        message: 'Skills updated successfully',
        data: { skills: profile.skills }
    });
});

// [PUT] /me/preferences
router.put('/me/preferences', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const profile = await Profile.findOne({ userId });
    if (!profile) throw new NotFoundError();

    profile.preferences = {
        ...profile.preferences,
        ...req.body
    };
    await profile.save();

    res.status(200).send({
        success: true,
        message: 'Preferences updated successfully',
        data: { preferences: profile.preferences }
    });
});

export { router as updateProfileRouter };
