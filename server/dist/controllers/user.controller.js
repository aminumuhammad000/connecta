import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// ===================
// Get All Users / Search Users
// ===================
export const getUsers = async (req, res) => {
    try {
        const { userType, skills, limit = 50, includeAdmins = 'false' } = req.query;
        const query = {};
        // Handle userType filter
        if (userType && userType !== 'all') {
            // If a specific userType is requested, use it
            query.userType = userType;
        }
        else if (includeAdmins !== 'true') {
            // Otherwise, exclude admins by default
            query.userType = { $ne: 'admin' };
        }
        if (skills) {
            query.skills = { $in: [skills] };
        }
        const users = await User.find(query)
            .select('-password') // Exclude password
            .limit(parseInt(limit))
            .sort({ jobSuccessScore: -1, averageRating: -1, createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    }
    catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err
        });
    }
};
// ===================
// Get All Freelancers
// ===================
export const getFreelancers = async (req, res) => {
    try {
        const { skills, limit = 50 } = req.query;
        const query = { userType: 'freelancer' };
        if (skills) {
            // If skills is a comma-separated string, split it
            const skillsList = skills.split(',').map(s => s.trim());
            query.skills = { $in: skillsList };
        }
        const freelancers = await User.find(query)
            .select('-password')
            .limit(parseInt(limit))
            .sort({ jobSuccessScore: -1, averageRating: -1, createdAt: -1 });
        res.status(200).json({
            success: true,
            count: freelancers.length,
            data: freelancers
        });
    }
    catch (err) {
        console.error('Get freelancers error:', err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err
        });
    }
};
// ===================
// Get User By ID
// ===================
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (err) {
        console.error('Get user by ID error:', err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err
        });
    }
};
// ===================
// Local Sign Up
// ===================
export const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, userType } = req.body;
        console.log('Signup attempt:', { firstName, lastName, email, userType });
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            userType,
            profileImage: `https://i.pravatar.cc/300?u=${email}`
        });
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        // Generate and send OTP automatically on signup
        try {
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            // Manage OTP record
            const OTP = (await import('../models/otp.model')).default;
            await OTP.deleteMany({ userId: newUser._id });
            await OTP.create({ userId: newUser._id, otp, expiresAt });
            // Send OTP email
            const { sendOTPEmail } = await import('../services/email.service');
            await sendOTPEmail(newUser.email, otp, newUser.firstName, 'EMAIL_VERIFICATION');
            console.log(`Automatic verification email sent to ${newUser.email}`);
        }
        catch (otpErr) {
            console.error('Failed to send automatic verification email on signup:', otpErr);
            // We don't block signup if email fails, user can still click resend
        }
        res.status(201).json({ user: newUser, token });
    }
    catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: "Server error", error: err });
    }
};
// ===================
// Local Sign In
// ===================
export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ success: true, user, token });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
// ===================
// Google Sign Up
// ===================
export const googleSignup = async (req, res) => {
    try {
        const { tokenId, userType } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            return res.status(400).json({ message: "Invalid Google token" });
        const { email, given_name, family_name } = payload;
        let user = await User.findOne({ email });
        if (user)
            return res.status(400).json({ message: "User already exists" });
        user = await User.create({
            firstName: given_name,
            lastName: family_name,
            email,
            userType,
            password: "", // no password needed for Google accounts
            profileImage: `https://i.pravatar.cc/300?u=${email}`
        });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({ user, token });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
// ===================
// ===================
// Resend Verification OTP
// ===================
export const resendVerificationOTP = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }
        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        // Manage OTP record
        const OTP = (await import('../models/otp.model')).default;
        await OTP.deleteMany({ userId: user._id });
        await OTP.create({ userId: user._id, otp, expiresAt });
        // Send OTP email
        const { sendOTPEmail } = await import('../services/email.service');
        const result = await sendOTPEmail(user.email, otp, user.firstName, 'EMAIL_VERIFICATION');
        if (!result.success) {
            return res.status(500).json({ message: "Failed to send verification email" });
        }
        res.status(200).json({ success: true, message: "Verification code sent" });
    }
    catch (err) {
        console.error('Resend OTP error:', err);
        res.status(500).json({ message: "Server error", error: err });
    }
};
// ===================
// Verify Email OTP
// ===================
export const verifyEmail = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { otp } = req.body;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        if (!otp)
            return res.status(400).json({ message: "OTP is required" });
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (user.isVerified) {
            return res.status(200).json({ success: true, message: "Email already verified" });
        }
        // Verify OTP
        const OTP = (await import('../models/otp.model')).default;
        const otpRecord = await OTP.findOne({ userId: user._id, otp, verified: false });
        if (!otpRecord)
            return res.status(400).json({ message: "Invalid OTP" });
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: "OTP expired" });
        }
        // Mark user as verified
        user.isVerified = true;
        await user.save();
        // Clean up OTP
        await OTP.deleteOne({ _id: otpRecord._id });
        // Send Welcome Email
        const { sendWelcomeEmail } = await import('../services/email.service');
        sendWelcomeEmail(user.email, user.firstName).catch(console.error);
        // Send Welcome Notification
        try {
            const mongoose = require('mongoose');
            const io = require('../core/utils/socketIO').getIO();
            await mongoose.model('Notification').create({
                userId: user._id,
                type: 'system',
                title: 'Welcome to Connecta!',
                message: 'Your account has been verified. You can now access all features.',
                relatedId: user._id,
                relatedType: 'user',
                actorId: null,
                actorName: 'System',
                isRead: false,
            });
            io.to(user._id.toString()).emit('notification:new', {
                title: 'Welcome to Connecta!',
                message: 'Your account has been verified.',
                type: 'system'
            });
            // Push Notification
            const notificationService = (await import('../services/notification.service')).default;
            notificationService.sendPushNotification(user._id.toString(), 'Welcome to Connecta! 🚀', 'Your account has been verified. You can now access all features.', { type: 'system' });
        }
        catch (e) {
            console.warn('Welcome notification error', e);
        }
        // Return updated user
        res.status(200).json({ success: true, message: "Email verified successfully", user });
    }
    catch (err) {
        console.error('Verify Email error:', err);
        res.status(500).json({ message: "Server error", error: err });
    }
};
// ===================
// Update Push Token
// ===================
export const updatePushToken = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { pushToken } = req.body;
        if (!pushToken) {
            return res.status(400).json({ message: "Push token is required" });
        }
        await User.findByIdAndUpdate(userId, { pushToken });
        res.status(200).json({ success: true, message: "Push token updated" });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
// ===================
// Google Sign In
// ===================
export const googleSignin = async (req, res) => {
    try {
        const { tokenId } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            return res.status(400).json({ message: "Invalid Google token" });
        const { email } = payload;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found, please sign up first" });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ success: true, user, token });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
// ===================
// Forgot Password - Send OTP
// ===================
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email"
            });
        }
        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        // Set expiration to 10 minutes from now
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        // Delete any existing OTPs for this user
        const OTP = (await import('../models/otp.model')).default;
        await OTP.deleteMany({ userId: user._id });
        // Create new OTP
        await OTP.create({
            userId: user._id,
            otp,
            expiresAt,
        });
        // Send OTP via email
        const { sendOTPEmail } = await import('../services/email.service');
        const result = await sendOTPEmail(email, otp, user.firstName, 'PASSWORD_RESET');
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || "Failed to send OTP email. Please try again."
            });
        }
        res.status(200).json({
            success: true,
            message: "OTP sent to your email successfully"
        });
    }
    catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err
        });
    }
};
// ===================
// Verify OTP
// ===================
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // Find OTP
        const OTP = (await import('../models/otp.model')).default;
        const otpRecord = await OTP.findOne({
            userId: user._id,
            otp,
            verified: false,
        });
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }
        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }
        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();
        // Generate reset token (valid for 15 minutes)
        const resetToken = jwt.sign({ userId: user._id, otpId: otpRecord._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            resetToken
        });
    }
    catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err
        });
    }
};
// ===================
// Reset Password
// ===================
export const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Reset token and new password are required"
            });
        }
        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }
        // Verify reset token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        }
        catch (err) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }
        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // Verify OTP was verified
        const OTP = (await import('../models/otp.model')).default;
        const otpRecord = await OTP.findById(decoded.otpId);
        if (!otpRecord || !otpRecord.verified) {
            return res.status(400).json({
                success: false,
                message: "Invalid reset token"
            });
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update user password
        user.password = hashedPassword;
        await user.save();
        // Delete OTP record
        await OTP.deleteOne({ _id: otpRecord._id });
        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    }
    catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err
        });
    }
};
// ===================
// Ban User
// ===================
export const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        user.isActive = false;
        await user.save();
        res.status(200).json({
            success: true,
            message: "User banned successfully",
            data: user
        });
    }
    catch (err) {
        console.error('Ban user error:', err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err
        });
    }
};
// ===================
// Unban User
// ===================
export const unbanUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        user.isActive = true;
        await user.save();
        res.status(200).json({
            success: true,
            message: "User unbanned successfully",
            data: user
        });
    }
    catch (err) {
        console.error('Unban user error:', err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err
        });
    }
};
// ===================
// Get Current User
// ===================
export const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (err) {
        console.error('Get current user error:', err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err
        });
    }
};
// ===================
// Change Password
// ===================
export const changePassword = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current and new passwords are required"
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });
        }
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect current password" });
        }
        // Update password (hashing handled by pre-save hook usually, or we hash it here)
        // Checking if pre-save hook exists in User model is safer. 
        // IF NOT, we must hash it here. 
        // Given signin just compares, let's assume pre-save hooks handles hashing on save.
        // BUT wait, `user.password = newPassword` might not trigger hash if logic is weak.
        // Let's check User model after this. Safe bet: hash it if plaintext.
        // For now, let's rely on User model knowing how to hash, OR manually hash.
        // Most likely: user.password = await bcrypt.hash(newPassword, 12);
        // I will check User model NEXT. For now, valid bcrypt check is key.
        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    }
    catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ message: "Server error", error: err });
    }
};
// ===================
// Update Push Token
// ===================
export const updateMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const { firstName, lastName, profileImage, email } = req.body;
        console.log('UpdateMe request body:', { firstName, lastName, profileImage, email });
        // Prepare update data
        const updateData = {};
        if (firstName)
            updateData.firstName = firstName;
        if (lastName)
            updateData.lastName = lastName;
        if (profileImage !== undefined)
            updateData.profileImage = profileImage;
        if (email)
            updateData.email = email;
        if (req.body.emailFrequency)
            updateData.emailFrequency = req.body.emailFrequency;
        console.log('UpdateMe updateData:', updateData);
        const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
        console.log('UpdateMe result - user email:', user?.email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user
        });
    }
    catch (err) {
        console.error('Update current user error:', err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err
        });
    }
};
// ===================
// Delete User
// ===================
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    }
    catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err
        });
    }
};
// ===================
// Switch User Type (Client <-> Freelancer)
// ===================
export const switchUserType = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Check if user is premium
        // Assume we have a method or property to check premium subscription
        // If not, we should probably implement one or check subscription status
        const Subscription = require('../models/Subscription.model').default;
        const activeSubscription = await Subscription.findOne({
            userId: user._id,
            status: 'active',
            plan: { $ne: 'free' },
            endDate: { $gt: new Date() }
        });
        if (!activeSubscription) {
            return res.status(403).json({
                success: false,
                message: "Premium subscription is required to switch user types."
            });
        }
        // Toggle user type
        user.userType = user.userType === 'freelancer' ? 'client' : 'freelancer';
        await user.save();
        res.status(200).json({
            success: true,
            message: `Switched to ${user.userType} successfully`,
            data: { userType: user.userType }
        });
    }
    catch (err) {
        console.error('Switch user type error:', err);
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
