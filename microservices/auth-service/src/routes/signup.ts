
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '@connecta/common';
import { User } from '../models/user.model';
import { Password } from '../services/password';
import { UserCreatedPublisher } from '../events/publishers/user-created-publisher';
import { rabbitMQWrapper } from '../rabbitmq-wrapper';

const router = express.Router();

router.post(
    '/signup',
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Password must be between 4 and 20 characters'),
    ],
    async (req: Request, res: Response) => {
        const { email, password, role } = req.body;

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            throw new BadRequestError('Email in use');
        }

        const hashedPassword = await Password.toHash(password);

        const user = await User.create({
            email,
            passwordHash: hashedPassword,
            role: role || 'freelancer',
            isVerified: false,
            lastLoginAt: new Date(),
            lastIpAddress: req.ip
        });

        // Generate Refresh Token
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_KEY!,
            { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        await new UserCreatedPublisher(rabbitMQWrapper.channel).publish({
            id: user.id,
            email: user.email,
            role: user.role,
            version: 1,
        });

        // Generate Access Token
        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_KEY!,
            { expiresIn: '1h' }
        );

        res.status(201).send({
            success: true,
            message: 'User created successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified
                },
                accessToken,
                refreshToken,
                expiresIn: 3600
            }
        });
    }
);

export { router as signupRouter };
