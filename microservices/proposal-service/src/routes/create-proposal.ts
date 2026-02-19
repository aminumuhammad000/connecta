
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError } from '@connecta/common';
import { Proposal } from '../models/proposal';
import { ProposalCreatedPublisher } from '../events/publishers/proposal-created-publisher';
import { rabbitMQWrapper } from '../rabbitmq-wrapper';

const router = express.Router();

router.post(
    '/',
    [
        body('jobId').not().isEmpty().withMessage('Job ID is required'),
        body('coverLetter').not().isEmpty().withMessage('Cover letter is required'),
        body('bidAmount').isFloat({ gt: 0 }).withMessage('Bid amount must be greater than 0'),
        body('duration').not().isEmpty().withMessage('Duration is required'),
    ],
    async (req: Request, res: Response) => {
        const { jobId, coverLetter, bidAmount, duration } = req.body;

        // Mock freelancerId (until auth middleware)
        const freelancerId = req.headers['x-user-id'] as string;

        if (!freelancerId) {
            throw new BadRequestError('User ID missing (Simulation: provide x-user-id header)');
        }

        const proposal = await Proposal.create({
            jobId,
            freelancerId,
            coverLetter,
            bidAmount,
            duration,
            status: 'pending'
        });

        await new ProposalCreatedPublisher(rabbitMQWrapper.channel).publish({
            id: proposal.id,
            jobId: proposal.jobId,
            freelancerId: proposal.freelancerId,
            bidAmount: proposal.bidAmount,
            duration: proposal.duration,
            status: proposal.status,
            version: 1,
        });

        res.status(201).send(proposal);
    }
);

export { router as createProposalRouter };
