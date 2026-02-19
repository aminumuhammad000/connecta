
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, BadRequestError } from '@connecta/common';
import { Notification } from '../models/notification.model';
import { NotificationSettings } from '../models/notification-settings.model';

const router = express.Router();

// [GET] / - List notifications for user
router.get('/', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.status(200).send({
        success: true,
        message: 'Notifications retrieved successfully',
        data: notifications
    });
});

// [PATCH] /read-all
router.patch('/read-all', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;

    await Notification.updateMany({ userId, read: false }, { read: true });

    res.status(200).send({
        success: true,
        message: 'All notifications marked as read',
        data: {}
    });
});

// [DELETE] /:id
router.delete('/:id', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const notification = await Notification.findOne({ _id: req.params.id, userId });

    if (!notification) throw new NotFoundError();

    await notification.deleteOne();

    res.status(200).send({
        success: true,
        message: 'Notification deleted successfully',
        data: {}
    });
});

// [GET] /settings
router.get('/settings', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;

    let settings = await NotificationSettings.findOne({ userId });

    if (!settings) {
        settings = await NotificationSettings.create({ userId });
    }

    res.status(200).send({
        success: true,
        message: 'Notification settings retrieved successfully',
        data: settings
    });
});

// [PUT] /settings
router.put('/settings', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;

    let settings = await NotificationSettings.findOne({ userId });

    if (!settings) {
        settings = new NotificationSettings({ userId });
    }

    Object.assign(settings, req.body);
    // Prevent userId update
    settings.userId = userId;

    await settings.save();

    res.status(200).send({
        success: true,
        message: 'Notification settings updated successfully',
        data: settings
    });
});

export { router as notificationRouter };
