import User from '../models/user.model.js';
import Profile from '../models/Profile.model.js';
export const uploadAvatar = async (req, res) => {
    try {
        console.log('🚀 Avatar Upload Started');
        if (!req.file) {
            console.error('❌ No file in request');
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const userId = req.user?.id;
        if (!userId) {
            console.error('❌ Unauthorized: No userId found in request');
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        // The file URL is provided by Cloudinary via multer-storage-cloudinary
        // It can be in .path, .secure_url, or .url depending on version/config
        const imageUrl = req.file.path || req.file.secure_url || req.file.url;
        if (!imageUrl) {
            console.error('❌ Cloudinary did not return a URL. File object:', req.file);
            return res.status(500).json({ success: false, message: 'Cloudinary upload failed to return a URL' });
        }
        console.log('📸 Cloudinary Upload Success:', imageUrl);
        // Update user's profile image in database
        const user = await User.findByIdAndUpdate(userId, { profileImage: imageUrl }, { new: true }).select('-password');
        if (!user) {
            console.error('❌ User not found in database:', userId);
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Also update the Profile model's avatar field for consistency
        // Use upsert: true in case the profile hasn't been created yet
        const profile = await Profile.findOneAndUpdate({ user: userId }, { avatar: imageUrl }, { upsert: true, new: true });
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
    }
    catch (error) {
        console.error('❌ Avatar Upload Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload avatar',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
