
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, BadRequestError, NotAuthorizedError } from '@connecta/common';
import { Contract } from '../models/contract.model';

const router = express.Router();

// [GET] /me - List contracts for user
router.get('/me', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;

    const contracts = await Contract.findAll({
        where: {
            [Symbol.for('or')]: [
                { clientId: userId },
                { freelancerId: userId }
            ]
        }
    });

    res.status(200).send({
        success: true,
        message: 'User contracts retrieved successfully',
        data: contracts
    });
});

// [GET] /:id - Contract details
router.get('/:id', async (req: Request, res: Response) => {
    const contract = await Contract.findByPk(req.params.id);

    if (!contract) throw new NotFoundError();

    res.status(200).send({
        success: true,
        message: 'Contract details retrieved successfully',
        data: contract
    });
});

// [PATCH] /:id/status - Update status
router.patch('/:id/status', [
    body('status').isIn(['active', 'completed', 'cancelled', 'disputed']).withMessage('Invalid status')
], async (req: Request, res: Response) => {
    const contract = await Contract.findByPk(req.params.id);
    if (!contract) throw new NotFoundError();

    contract.status = req.body.status;
    await contract.save();

    res.status(200).send({
        success: true,
        message: `Contract status updated to ${contract.status}`,
        data: { status: contract.status }
    });
});

// [POST] /:id/terminate
router.post('/:id/terminate', async (req: Request, res: Response) => {
    const contract = await Contract.findByPk(req.params.id);
    if (!contract) throw new NotFoundError();

    contract.status = 'terminated';
    await contract.save();

    res.status(200).send({
        success: true,
        message: 'Contract terminated successfully',
        data: { status: contract.status }
    });
});

// [POST] /:id/dispute
router.post('/:id/dispute', [
    body('reason').notEmpty().withMessage('Reason is required')
], async (req: Request, res: Response) => {
    const contract = await Contract.findByPk(req.params.id);
    if (!contract) throw new NotFoundError();

    contract.status = 'disputed';
    await contract.save();

    // TODO: Publish DisputeCreated event

    res.status(200).send({
        success: true,
        message: 'Contract marked as disputed. Dispute resolution initiated.',
        data: { status: contract.status }
    });
});

// [GET] /:id/agreement (PDF Mock)
router.get('/:id/agreement', async (req: Request, res: Response) => {
    const contract = await Contract.findByPk(req.params.id);
    if (!contract) throw new NotFoundError();

    res.status(200).send({
        success: true,
        message: 'Agreement generated successfully',
        data: {
            pdfUrl: `https://storage.connecta.com/agreements/${contract.id}.pdf`
        }
    });
});

export { router as contractRouter };
