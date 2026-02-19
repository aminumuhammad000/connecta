
import express, { Request, Response } from 'express';
import { SparkTransaction } from '../models/spark-transaction';
import { BadRequestError } from '@connecta/common';

const router = express.Router();

router.get('/balance', async (req: Request, res: Response) => {
    // Mock user ID (until auth middleware)
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
        throw new BadRequestError('User ID missing (Simulation: provide x-user-id header)');
    }

    const transactions = await SparkTransaction.findAll({
        where: { userId }
    });

    const balance = transactions.reduce((acc, txn) => acc + txn.amount, 0);

    res.status(200).send({
        success: true,
        message: 'Reward balance retrieved',
        data: { userId, balance }
    });
});


router.post('/transaction', async (req: Request, res: Response) => {
    // This is a simplified internal/admin route for demo purposes
    // IN REAL APP: This would likely happen via Events (JobCompleted) or internal logic
    const { userId, amount, type, description, referenceId } = req.body;

    const transaction = await SparkTransaction.create({
        userId,
        amount,
        type,
        description,
        referenceId
    });

    res.status(201).send({
        success: true,
        message: 'Reward transaction created',
        data: transaction
    });
});

export { router as rewardsRouter };
