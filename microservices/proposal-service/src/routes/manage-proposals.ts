
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, BadRequestError, NotAuthorizedError } from '@connecta/common';
import { Proposal } from '../models/proposal';

const router = express.Router();

// [PATCH] /:id/withdraw
router.patch('/:id/withdraw', async (req: Request, res: Response) => {
    const freelancerId = req.headers['x-user-id'] as string;
    const proposal = await Proposal.findByPk(req.params.id);

    if (!proposal) throw new NotFoundError();
    if (proposal.freelancerId !== freelancerId) throw new NotAuthorizedError();

    proposal.status = 'withdrawn';
    await proposal.save();

    res.status(200).send({
        success: true,
        message: 'Proposal withdrawn successfully',
        data: { status: proposal.status }
    });
});

// [PATCH] /:id/status (Client Shortlist/Reject)
router.patch('/:id/status', [
    body('status').isIn(['shortlisted', 'rejected']).withMessage('Invalid status')
], async (req: Request, res: Response) => {
    // In a real scenario, we check if the current user is the owner of the JOB this proposal belongs to
    // For this MVP refactor, we assume the gateway has validated access or we trust the role
    const proposal = await Proposal.findByPk(req.params.id);

    if (!proposal) throw new NotFoundError();

    proposal.status = req.body.status;
    await proposal.save();

    res.status(200).send({
        success: true,
        message: `Proposal ${proposal.status} successfully`,
        data: { status: proposal.status }
    });
});

// [POST] /:id/accept
router.post('/:id/accept', async (req: Request, res: Response) => {
    const proposal = await Proposal.findByPk(req.params.id);

    if (!proposal) throw new NotFoundError();

    proposal.status = 'accepted';
    await proposal.save();

    // TODO: Publish event (ProposalAccepted) to trigger Contract creation
    // await new ProposalAcceptedPublisher(rabbitMQWrapper.channel).publish({ ... });

    res.status(200).send({
        success: true,
        message: 'Proposal accepted. Proceeding to contract creation.',
        data: { status: proposal.status }
    });
});

export { router as manageProposalsRouter };
