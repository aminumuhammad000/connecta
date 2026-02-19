
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '@connecta/common';
import { User } from '../models/user.model';
import { Password } from '../services/password';

const router = express.Router();

router.post(
    '/signin',
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password'),
    ],
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const passwordsMatch = await Password.compare(
            existingUser.passwordHash,
            password
        );
        if (!passwordsMatch) {
            throw new BadRequestError('Invalid credentials');
        }

        // Generate Refresh Token
        const refreshToken = jwt.sign(
            { id: existingUser.id },
            process.env.REFRESH_TOKEN_KEY!,
            { expiresIn: '7d' }
        );

        existingUser.refreshToken = refreshToken;
        existingUser.lastLoginAt = new Date();
        existingUser.lastIpAddress = req.ip;
        await existingUser.save();

        // Generate Access Token
        const accessToken = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
                role: existingUser.role
            },
            process.env.JWT_KEY!,
            { expiresIn: '1h' }
        );

        res.status(200).send({
            success: true,
            message: 'Signin successful',
            data: {
                user: {
                    id: existingUser.id,
                    email: existingUser.email,
                    role: existingUser.role,
                    isVerified: existingUser.isVerified
                },
                accessToken,
                refreshToken,
                expiresIn: 3600
            }
        });
    }
);

export { router as signinRouter };
