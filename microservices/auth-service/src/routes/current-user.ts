
import express from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '@connecta/common';

const router = express.Router();

router.get('/currentuser', (req, res) => {
    // If no session or JWT, return null
    if (!req.session?.jwt) {
        return res.send({
            success: true,
            message: 'No active session',
            data: { currentUser: null }
        });
    }

    try {
        const payload = jwt.verify(
            req.session.jwt,
            process.env.JWT_KEY!
        );
        res.send({
            success: true,
            message: 'Current user retrieved',
            data: { currentUser: payload }
        });
    } catch (err) {
        res.send({
            success: true,
            message: 'No active session',
            data: { currentUser: null }
        });
    }
});

export { router as currentUserRouter };
