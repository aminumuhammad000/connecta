import { Request, Response } from 'express';
import User from '../models/user.model.js';
import Profile from '../models/Profile.model.js';
import { isCloudinaryConfigured, cloudinary } from '../config/cloudinary.config.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const uploadAvatar = async (req: Request, res: Response) => {
    try {
        console.log('🚀 Avatar Upload Started');

        if (!req.file) {
            console.error('❌ No file in request');
            console.log('Request Headers:', req.headers);
            console.log('Request Body:', req.body);
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const userId = (req as any).user?.id;
        if (!userId) {
            console.error('❌ Unauthorized: No userId found in request');
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // The file URL is provided by Cloudinary via manual upload if configured
        let imageUrl = '';

        if (isCloudinaryConfigured) {
            console.log('☁️ Uploading file to Cloudinary...');
            const tempDir = path.join(process.cwd(), 'uploads', 'temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempFilePath = path.join(tempDir, `${uuidv4()}-${req.file.originalname}`);
            fs.writeFileSync(tempFilePath, req.file.buffer);

            try {
                const result = await cloudinary.uploader.upload(tempFilePath, {
                    folder: 'connecta/avatars',
                    transformation: [{ width: 500, height: 500, crop: 'limit' }],
                });
                imageUrl = result.secure_url || result.url;
            } finally {
                // Delete temp file
                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            }
        } else {
            // Local storage logic (this shouldn't happen with memoryStorage unless we save manually)
            // But if we wanted to support local we'd write the buffer to disk here.
            return res.status(500).json({ success: false, message: 'Local storage not implemented for memory storage' });
        }

        if (!imageUrl) {
            console.error('❌ Upload failed to return a URL. File object:', req.file);
            return res.status(500).json({ success: false, message: 'Upload failed' });
        }

        console.log('📸 Upload Success:', imageUrl);

        // Update user's profile image in database
        const user = await User.findByIdAndUpdate(
            userId,
            { profileImage: imageUrl },
            { new: true }
        ).select('-password');

        if (!user) {
            console.error('❌ User not found in database:', userId);
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Also update the Profile model's avatar field for consistency
        // Use upsert: true in case the profile hasn't been created yet
        const profile = await Profile.findOneAndUpdate(
            { user: userId },
            { avatar: imageUrl },
            { upsert: true, new: true }
        );

        console.log('✅ Database updated successfully for user:', userId);

        res.status(200).json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
                url: imageUrl,
                user,
                profile
            }
        });
    } catch (error: any) {
        console.error('❌ Avatar Upload Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload avatar',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
// Public upload (for users not yet in DB)
export const publicUploadAvatar = async (req: Request, res: Response) => {
    try {
        const logFile = 'public_upload_debug.log';
        const log = (msg: string) => fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);

        log('📬 Public upload request received');
        if (!req.file) {
            log('❌ No file in request');
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        log(`📎 File: ${req.file.originalname} (${req.file.size} bytes)`);

        let imageUrl = '';

        if (isCloudinaryConfigured) {
            log('☁️ Using Cloudinary');
            const result = await new Promise<any>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'connecta/avatars', timeout: 120000, resource_type: 'image' },
                    (error, result) => {
                        if (error) {
                            log(`❌ Cloudinary error: ${error.message}`);
                            reject(error);
                        } else {
                            log(`✅ Cloudinary success: ${result?.secure_url}`);
                            resolve(result);
                        }
                    }
                );
                uploadStream.end(req.file!.buffer);
            });
            imageUrl = result.secure_url || result.url;
        } else {
            log('📁 Using local fallback');
            const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
            if (!fs.existsSync(uploadDir)) {
                log(`creating dir: ${uploadDir}`);
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filename = `public-${uuidv4()}-${req.file.originalname}`;
            const filePath = path.join(uploadDir, filename);
            log(`Writing to: ${filePath}`);
            fs.writeFileSync(filePath, req.file.buffer);
            imageUrl = `/uploads/avatars/${filename}`;
            log(`✅ Local success: ${imageUrl}`);
        }

        res.status(200).json({
            success: true,
            message: isCloudinaryConfigured ? 'Image uploaded to Cloudinary' : 'Image saved locally',
            url: imageUrl
        });
    } catch (error: any) {
        fs.appendFileSync('public_upload_debug.log', `[${new Date().toISOString()}] ❌ FATAL ERROR: ${error.message}\n${error.stack}\n`);
        console.error('❌ Public Upload fatal error:', error);
        res.status(500).json({
            success: false,
            message: `Upload failed: ${error.message}`,
            error: error.message
        });
    }
};
