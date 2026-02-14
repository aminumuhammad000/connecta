import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('multer-storage-cloudinary');
const CloudinaryStorage = pkg.CloudinaryStorage || pkg.default?.CloudinaryStorage || pkg;
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'connecta-workspace',
            resource_type: 'auto',
            public_id: file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_') + '-' + Date.now(),
        };
    }
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
