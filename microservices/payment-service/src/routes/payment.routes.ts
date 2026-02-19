
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, BadRequestError } from '@connecta/common';
import { Payment } from '../models/payment.model';

const router = express.Router();

// [GET] /transactions - Wallet history
router.get('/transactions', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;

    const payments = await Payment.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
    });

    res.status(200).send({
        success: true,
        message: 'Transaction history retrieved successfully',
        data: payments
    });
});

// [POST] /initialize
router.post('/initialize', [
    body('amount').isNumeric().withMessage('Amount is required'),
    body('contractId').notEmpty().withMessage('Contract ID is required'),
    body('idempotencyKey').notEmpty().withMessage('Idempotency key is required')
], async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const { amount, contractId, idempotencyKey, callbackUrl } = req.body;

    // TODO: Integrate with real payment provider (e.g. Paystack)
    // For now, mock a pending payment record

    const payment = await Payment.create({
        userId,
        contractId,
        amount,
        currency: 'NGN',
        status: 'pending',
        paymentMethod: 'card',
        transactionId: `TXN_${Date.now()}`,
        idempotencyKey,
        callbackUrl
    });

    res.status(201).send({
        success: true,
        message: 'Payment initialized',
        data: {
            paymentId: payment.id,
            authorizationUrl: 'https://paystack.com/authorize/MOCK'
        }
    });
});

// [POST] /escrow/release
router.post('/escrow/release', [
    body('contractId').notEmpty().withMessage('Contract ID is required')
], async (req: Request, res: Response) => {
    // Release logic
    res.status(200).send({
        success: true,
        message: 'Funds released from escrow',
        data: {}
    });
});

// [POST] /payouts/request
router.post('/payouts/request', [
    body('amount').isNumeric().withMessage('Amount is required'),
    body('bankAccount').notEmpty().withMessage('Bank account is required')
], async (req: Request, res: Response) => {
    res.status(200).send({
        success: true,
        message: 'Payout requested successfully',
        data: {}
    });
});

export { router as paymentRouter };
