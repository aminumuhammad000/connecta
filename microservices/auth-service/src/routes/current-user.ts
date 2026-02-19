
import express from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '@connecta/common';

const router = express.Router();

router.get('/currentuser', (req, res) => {
    // If no session or JWT, return null
    if (!req.session?.jwt) {
        return res.send({ currentUser: null });
    }

    try {
        const payload = jwt.verify(
            req.session.jwt,
            process.env.JWT_KEY!
        );
        res.send({ currentUser: payload });
    } catch (err) {
        res.send({ currentUser: null });
    }
});

export { router as currentUserRouter };
