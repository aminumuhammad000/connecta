
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError } from '@connecta/common';
import { User } from '../models/user.model';

const router = express.Router();

router.post('/resend-otp',
    [
        body('email').isEmail().withMessage('Email must be valid')
    ],
    async (req: Request, res: Response) => {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            // For security, don't reveal if user exists
            return res.status(200).send({
                success: true,
                message: 'If an account with that email exists, a new verification code has been sent.',
                data: {}
            });
        }

        if (user.isVerified) {
            throw new BadRequestError('Account is already verified');
        }

        // TODO: Generate and send new OTP via email/SMS
        // Simulating the action here.

        res.status(200).send({
            success: true,
            message: 'Verification code resent successfully',
            data: {}
        });
    }
);

export { router as resendOtpRouter };
