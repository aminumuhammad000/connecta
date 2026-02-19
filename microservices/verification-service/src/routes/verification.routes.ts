
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, BadRequestError } from '@connecta/common';
import { Verification } from '../models/verification.model';

const router = express.Router();

// [POST] /submit
router.post('/submit', [
    body('idType').notEmpty().withMessage('ID type is required'),
    body('idNumber').notEmpty().withMessage('ID number is required'),
    body('country').notEmpty().withMessage('Country is required')
], async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;

    const existing = await Verification.findOne({ userId });
    if (existing && existing.status !== 'rejected') {
        throw new BadRequestError('Verification already in progress or approved');
    }

    const verificationData = {
        ...req.body,
        userId,
        status: 'pending'
    };

    if (existing) {
        Object.assign(existing, verificationData);
        await existing.save();
    } else {
        await Verification.create(verificationData);
    }

    res.status(201).send({
        success: true,
        message: 'Verification documents submitted successfully',
        data: {}
    });
});

// [GET] /status
router.get('/status', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const verification = await Verification.findOne({ userId });

    if (!verification) throw new NotFoundError();

    res.status(200).send({
        success: true,
        message: 'Verification status retrieved',
        data: verification
    });
});

// [GET] /admin/pending
router.get('/admin/pending', async (req: Request, res: Response) => {
    // In real app, check for admin role from gateway
    const verifications = await Verification.find({ status: 'pending' });

    res.status(200).send({
        success: true,
        message: 'Pending verifications retrieved',
        data: verifications
    });
});

// [PATCH] /admin/:id/approve
router.patch('/admin/:id/approve', async (req: Request, res: Response) => {
    const verification = await Verification.findById(req.params.id);
    if (!verification) throw new NotFoundError();

    verification.status = 'approved';
    await verification.save();

    // TODO: Publish VerificationApproved event to notify other services (e.g. Rewards)

    res.status(200).send({
        success: true,
        message: 'Verification approved',
        data: { status: verification.status }
    });
});

// [PATCH] /admin/:id/reject
router.patch('/admin/:id/reject', [
    body('reason').notEmpty().withMessage('Rejection reason is required')
], async (req: Request, res: Response) => {
    const verification = await Verification.findById(req.params.id);
    if (!verification) throw new NotFoundError();

    verification.status = 'rejected';
    verification.adminNotes = req.body.reason;
    await verification.save();

    res.status(200).send({
        success: true,
        message: 'Verification rejected',
        data: { status: verification.status }
    });
});

export { router as verificationRouter };
