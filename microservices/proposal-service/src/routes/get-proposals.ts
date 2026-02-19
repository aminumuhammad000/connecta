
import express, { Request, Response } from 'express';
import { Proposal } from '../models/proposal';

const router = express.Router();

// [GET] /me - List proposals submitted by current freelancer
router.get('/me', async (req: Request, res: Response) => {
    const freelancerId = req.headers['x-user-id'] as string;

    const proposals = await Proposal.findAll({
        where: { freelancerId }
    });

    res.status(200).send({
        success: true,
        message: 'Freelancer proposals retrieved successfully',
        data: proposals
    });
});

// [GET] /:id - Proposal details
router.get('/:id', async (req: Request, res: Response) => {
    const proposal = await Proposal.findByPk(req.params.id);

    if (!proposal) {
        throw new NotFoundError();
    }

    res.status(200).send({
        success: true,
        message: 'Proposal details retrieved successfully',
        data: proposal
    });
});

// [GET] /job/:jobId - Fetch proposals for job (usually for clients)
router.get('/job/:jobId', async (req: Request, res: Response) => {
    const { jobId } = req.params;

    const proposals = await Proposal.findAll({
        where: { jobId }
    });

    res.status(200).send({
        success: true,
        message: 'Job proposals retrieved successfully',
        data: proposals
    });
});

export { router as getProposalsRouter };
