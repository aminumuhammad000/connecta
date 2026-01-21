import express from 'express';
import { authenticate } from '../core/middleware/auth.middleware';
import { addPortfolioItem, deletePortfolioItem, getPortfolioItems } from '../controllers/portfolio.controller';
const router = express.Router();
// Get portfolio items (can be public or protected, but let's default to protected/checking profile visibility)
// For now, allow viewing any user's portfolio by ID
router.get('/:userId', authenticate, getPortfolioItems);
// Protected routes (Self management)
router.post('/', authenticate, addPortfolioItem);
router.delete('/:id', authenticate, deletePortfolioItem);
export default router;
