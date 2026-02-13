import express from 'express';
import multer from 'multer';
import { avatarStorage } from '../config/cloudinary.config.js';
import { uploadAvatar, publicUploadAvatar } from '../controllers/avatar.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';

const router = express.Router();
const upload = multer({ storage: avatarStorage });

router.post('/upload', authenticate, upload.single('avatar'), uploadAvatar);
router.post('/public-upload', upload.single('avatar'), publicUploadAvatar);

export default router;
