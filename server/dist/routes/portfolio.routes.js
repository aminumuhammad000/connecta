import express from 'express';
import { authenticate } from '../core/middleware/auth.middleware';
import { addPortfolioItem, deletePortfolioItem, getPortfolioItems, uploadPortfolioImage } from '../controllers/portfolio.controller';
import multer from 'multer';
import { portfolioStorage } from '../config/cloudinary.config';
const router = express.Router();
const upload = multer({ storage: portfolioStorage });
// Upload portfolio image
router.post('/upload', authenticate, upload.single('file'), uploadPortfolioImage);
// Get portfolio items (can be public or protected, but let's default to protected/checking profile visibility)
// For now, allow viewing any user's portfolio by ID
router.get('/:userId', authenticate, getPortfolioItems);
// Protected routes (Self management)
router.post('/', authenticate, addPortfolioItem);
router.delete('/:id', authenticate, deletePortfolioItem);
export default router;
