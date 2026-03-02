import { v2 as cloudinary } from 'cloudinary';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const multerStorageCloudinary = require('multer-storage-cloudinary');
const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary.default?.CloudinaryStorage || multerStorageCloudinary;
import dotenv from 'dotenv';
dotenv.config();
// Debug: Check if Cloudinary env vars are loaded
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Cloudinary environment variables are missing!');
    console.log('Available Env Vars:', Object.keys(process.env).filter(key => key.startsWith('CLOUDINARY')));
}
else {
    console.log('✅ Cloudinary environment variables loaded');
}
const isCloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
let avatarStorage;
let portfolioStorage;
if (isCloudinaryConfigured) {
    console.log('☁️ Using Cloudinary for storage');
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    avatarStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'connecta/avatars',
        },
    });
    portfolioStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'connecta/portfolio',
            transformation: [{ width: 1200, height: 800, crop: 'limit' }],
        },
    });
}
else {
    console.warn('📁 Cloudinary not configured. Falling back to local disk storage.');
    const fs = await import('fs');
    const path = await import('path');
    const multer = await import('multer');
    // Create uploads directory if it doesn't exist
    const uploadDirs = ['uploads/avatars', 'uploads/portfolio'];
    uploadDirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    avatarStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/avatars');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
    portfolioStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/portfolio');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
}
export { cloudinary, avatarStorage, portfolioStorage, isCloudinaryConfigured };
