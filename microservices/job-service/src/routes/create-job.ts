
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError } from '@connecta/common'; // we will need requireAuth later
import { Job } from '../models/job';
import { JobCreatedPublisher } from '../events/publishers/job-created-publisher';
import { rabbitMQWrapper } from '../rabbitmq-wrapper';

const router = express.Router();

router.post(
    '/',
    [
        body('title').not().isEmpty().withMessage('Title is required'),
        body('description').not().isEmpty().withMessage('Description is required'),
        body('budget').isFloat({ gt: 0 }).withMessage('Budget must be greater than 0'),
    ],
    async (req: Request, res: Response) => {
        const { title, description, budget, category, experienceLevel, visibility, skillsRequired } = req.body;

        // Mock userId for now until we have auth middleware in this service
        // In real implementation: const userId = req.currentUser!.id;
        const userId = req.headers['x-user-id'] as string;

        if (!userId) {
            throw new BadRequestError('User ID missing (Simulation: provide x-user-id header)');
        }

        const job = Job.build({
            title,
            description,
            budget,
            userId,
            category: category || 'Uncategorized',
            status: 'draft',
            experienceLevel: experienceLevel || 'intermediate',
            visibility: visibility || 'public',
            skillsRequired: skillsRequired || []
        });
        await job.save();

        await new JobCreatedPublisher(rabbitMQWrapper.channel).publish({
            id: job.id,
            title: job.title,
            description: job.description,
            budget: job.budget,
            userId: job.userId,
            version: job.version,
        });

        res.status(201).send(job);
    }
);

export { router as createJobRouter };
