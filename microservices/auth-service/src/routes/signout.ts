
import express from 'express';

const router = express.Router();

router.post('/signout', (req, res) => {
    req.session = null;

    res.send({
        success: true,
        message: 'Signed out successfully',
        data: {}
    });
});

export { router as signoutRouter };
