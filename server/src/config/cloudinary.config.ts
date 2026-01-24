import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Avatar Storage
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'connecta/avatars',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 500, height: 500, crop: 'limit' }],
        };
    },
});

// Portfolio Storage
const portfolioStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'connecta/portfolio',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 1200, height: 800, crop: 'limit' }],
        };
    },
});

export { cloudinary, avatarStorage, portfolioStorage };
