
import express, { Request, Response } from 'express';
import { Job } from '../models/job';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { category, status, experienceLevel } = req.query;

    const query: any = {
        deletedAt: null,
        status: status || 'published', // Default to showing only published jobs
        visibility: 'public'
    };

    if (category) query.category = category;
    if (experienceLevel) query.experienceLevel = experienceLevel;

    const jobs = await Job.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.status(200).send({
        success: true,
        message: 'Jobs retrieved successfully',
        data: {
            jobs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

export { router as indexJobRouter };
