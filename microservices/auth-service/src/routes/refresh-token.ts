
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { BadRequestError, NotAuthorizedError } from '@connecta/common';
import { User } from '../models/user.model';

const router = express.Router();

router.post('/refresh-token', async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new BadRequestError('Refresh token is required');
    }

    try {
        const payload = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_KEY!
        ) as { id: string };

        const user = await User.findByPk(payload.id);

        if (!user || user.refreshToken !== refreshToken) {
            throw new NotAuthorizedError();
        }

        // Generate new Access Token
        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_KEY!,
            { expiresIn: '1h' }
        );

        // Optional: Rotate Refresh Token
        const newRefreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_KEY!,
            { expiresIn: '7d' }
        );

        user.refreshToken = newRefreshToken;
        await user.save();

        res.status(200).send({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                expiresIn: 3600
            }
        });
    } catch (err) {
        throw new NotAuthorizedError();
    }
});

export { router as refreshTokenRouter };
