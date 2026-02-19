
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError, NotFoundError } from '@connecta/common';
import { User } from '../models/user.model';
import { Password } from '../services/password';

const router = express.Router();

// [POST] /forgot-password
router.post('/forgot-password',
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
                message: 'If an account with that email exists, a password reset link has been sent.',
                data: {}
            });
        }

        // Generate a short-lived reset token
        const resetToken = jwt.sign(
            { id: user.id },
            process.env.JWT_KEY!,
            { expiresIn: '15m' }
        );

        // TODO: Send email with resetToken in real scenario
        // In this implementation, we simulate sending.

        res.status(200).send({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
            data: {
                resetToken // Returning for testing purposes, remove in production
            }
        });
    }
);

// [POST] /reset-password
router.post('/reset-password',
    [
        body('token').notEmpty().withMessage('Token is required'),
        body('newPassword')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Password must be between 4 and 20 characters'),
    ],
    async (req: Request, res: Response) => {
        const { token, newPassword } = req.body;

        try {
            const payload = jwt.verify(token, process.env.JWT_KEY!) as { id: string };
            const user = await User.findByPk(payload.id);

            if (!user) {
                throw new NotFoundError();
            }

            const hashedPassword = await Password.toHash(newPassword);
            user.passwordHash = hashedPassword;
            user.refreshToken = null; // Invalidate current refresh token on password change
            await user.save();

            res.status(200).send({
                success: true,
                message: 'Password reset successful',
                data: {}
            });
        } catch (err) {
            throw new BadRequestError('Invalid or expired reset token');
        }
    }
);

export { router as passwordRecoveryRouter };
