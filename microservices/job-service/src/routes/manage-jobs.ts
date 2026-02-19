
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, BadRequestError, NotAuthorizedError } from '@connecta/common';
import { Job } from '../models/job';

const router = express.Router();

// [GET] /me - List jobs created by current client
router.get('/me', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = { userId, deletedAt: null };
    const jobs = await Job.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Job.countDocuments(query);

    res.status(200).send({
        success: true,
        message: 'Owner jobs retrieved successfully',
        data: {
            jobs,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        }
    });
});

// [PUT] /:id - Update job
router.put('/:id', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const job = await Job.findOne({ _id: req.params.id, deletedAt: null });

    if (!job) throw new NotFoundError();
    if (job.userId !== userId) throw new NotAuthorizedError();

    Object.assign(job, req.body);
    // Prevent sensitive field updates
    job.userId = userId;

    await job.save();

    res.status(200).send({
        success: true,
        message: 'Job updated successfully',
        data: job
    });
});

// [PATCH] /:id/status - Update status
router.patch('/:id/status', [
    body('status').isIn(['draft', 'published', 'paused', 'closed']).withMessage('Invalid status')
], async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const job = await Job.findOne({ _id: req.params.id, deletedAt: null });

    if (!job) throw new NotFoundError();
    if (job.userId !== userId) throw new NotAuthorizedError();

    job.status = req.body.status;
    await job.save();

    res.status(200).send({
        success: true,
        message: `Job status updated to ${job.status}`,
        data: { status: job.status }
    });
});

// [DELETE] /:id - Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const job = await Job.findOne({ _id: req.params.id, deletedAt: null });

    if (!job) throw new NotFoundError();
    if (job.userId !== userId) throw new NotAuthorizedError();

    job.deletedAt = new Date();
    await job.save();

    res.status(200).send({
        success: true,
        message: 'Job deleted successfully',
        data: {}
    });
});

export { router as manageJobsRouter };
