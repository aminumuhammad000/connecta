
import express, { Request, Response } from 'express';
import { NotFoundError } from '@connecta/common';
import { Job } from '../models/job';

const router = express.Router();

router.get('/:id', async (req: Request, res: Response) => {
    const job = await Job.findOne({ _id: req.params.id, deletedAt: null });

    if (!job) {
        throw new NotFoundError();
    }

    res.status(200).send({
        success: true,
        message: 'Job details retrieved successfully',
        data: job
    });
});

export { router as showJobRouter };
