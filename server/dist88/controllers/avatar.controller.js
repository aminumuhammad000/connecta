import User from '../models/user.model';
import Profile from '../models/Profile.model';
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        // The file URL is provided by Cloudinary via multer-storage-cloudinary
        const imageUrl = req.file.path;
        console.log('📸 Cloudinary Upload Success:', imageUrl);
        // Update user's profile image in database
        const user = await User.findByIdAndUpdate(userId, { profileImage: imageUrl }, { new: true }).select('-password');
        // Also update the Profile model's avatar field for consistency
        await Profile.findOneAndUpdate({ user: userId }, { avatar: imageUrl });
        res.status(200).json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
                url: imageUrl,
                user
            }
        });
    }
    catch (error) {
        console.error('❌ Avatar Upload Error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload avatar', error: error.message });
    }
};
