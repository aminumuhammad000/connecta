import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import { sendOTPEmail, sendWelcomeEmail } from "../services/email.service.js";
import notificationService from "../services/notification.service.js";
import mongoose from "mongoose";
import SparkTransaction from "../models/SparkTransaction.model.js";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// ===================
// Check if Email Exists
// ===================
// ===================
// Check if Email Exists
// ===================
export const checkEmailExists = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        const user = await User.findOne({ email });
        res.status(200).json({ success: true, exists: !!user });
    }
    catch (err) {
        console.error('Check email error:', err);
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
// ===================
// Check if Phone Exists
// ===================
export const checkPhoneExists = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: "Phone number is required" });
        }
        const user = await User.findOne({ phoneNumber });
        res.status(200).json({ success: true, exists: !!user });
    }
    catch (err) {
        console.error('Check phone error:', err);
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
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
export const initiateSignup = async (req, res) => {
    try {
        const { email, firstName, preferredLanguage } = req.body;
        console.log('Initiating signup for:', email);
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await OTP.deleteMany({ email });
        await OTP.create({ email, otp, expiresAt });
        await sendOTPEmail(email, otp, firstName || 'User', 'EMAIL_VERIFICATION', preferredLanguage || 'en');
        res.status(200).json({ success: true, message: "Verification code sent" });
    }
    catch (err) {
        console.error('Initiate signup error:', err);
        res.status(500).json({ message: "Server error", error: err });
    }
};
// ===================
// Local Sign Up (Complete)
// ===================
export const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, userType, otp, ...otherDetails } = req.body;
        console.log('Signup completion attempt:', { firstName, lastName, email, userType });
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });
        // Verify OTP first
        const otpRecord = await OTP.findOne({ email, otp, verified: false });
        if (!otpRecord)
            return res.status(400).json({ message: "Invalid verification code" });
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: "Verification code expired" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // Generate unique referral code
        const generateReferralCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 8; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };
        let referralCode = generateReferralCode();
        // Ensure uniqueness (simple check, could be better)
        let isUnique = false;
        while (!isUnique) {
            const existing = await User.findOne({ referralCode });
            if (!existing)
                isUnique = true;
            else
                referralCode = generateReferralCode();
        }
        const { referrerCode } = req.body;
        let referredBy = undefined;
        if (referrerCode) {
            const referrer = await User.findOne({ referralCode: referrerCode.toUpperCase() });
            if (referrer) {
                referredBy = referrer._id;
                // Award sparks to referrer
                const referralBonus = 50;
                referrer.sparks = (referrer.sparks || 0) + referralBonus;
                await referrer.save();
                // Record transaction for referrer
                await SparkTransaction.create({
                    userId: referrer._id,
                    type: 'referral',
                    amount: referralBonus,
                    balanceAfter: referrer.sparks,
                    description: `Referral bonus for inviting ${firstName}`
                });
            }
        }
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            userType,
            isVerified: true,
            profileImage: otherDetails.avatar || otherDetails.profileImage || `https://i.pravatar.cc/300?u=${email}`,
            referralCode,
            referredBy,
            sparks: 50, // Signup bonus
            ...otherDetails
        });
        // Record transaction for signup bonus
        await SparkTransaction.create({
            userId: newUser._id,
            type: 'bonus',
            amount: 50,
            balanceAfter: 50,
            description: 'Welcome bonus for joining Connecta! 🎉'
        });
        const token = jwt.sign({ id: newUser._id, userType: newUser.userType }, process.env.JWT_SECRET, { expiresIn: "7d" });
        // Clean up OTP
        await OTP.deleteOne({ _id: otpRecord._id });
        // Send Welcome Email
        sendWelcomeEmail(newUser.email, newUser.firstName, newUser.preferredLanguage || 'en').catch(console.error);
        console.log('✅ Signup successful. Returning data for:', newUser.email);
        res.status(201).json({ user: newUser, token, success: true });
    }
    catch (err) {
        console.error('❌ Signup completion error:', err);
        res.status(500).json({ message: "Server error", error: err });
    }
};
// ===================
// Local Sign In
// ===================
export const signin = async (req, res) => {
    try {
        console.log('Signin Attempt:', req.body);
        const { email, password } = req.body;
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User.findOne({ email });
        console.log('User found:', user ? user._id : 'null');
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // Check if user has a password (if signed up via Google, password might be empty)
        if (!user.password) {
            return res.status(400).json({ message: "This account uses Google Sign-In. Please sign in with Google." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing in environment variables");
            return res.status(500).json({ message: "Server configuration error" });
        }
        const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: "7d" });
        console.log('Token generated successfully');
        res.status(200).json({ success: true, user, token });
    }
    catch (err) {
        console.error("Signin error:", err);
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
        const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: "7d" });
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
        // Generate unique referral code
        const generateReferralCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 8; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };
        let referralCode = generateReferralCode();
        // Ensure uniqueness
        let isUnique = false;
        while (!isUnique) {
            const existing = await User.findOne({ referralCode });
            if (!existing)
                isUnique = true;
            else
                referralCode = generateReferralCode();
        }
        const { referrerCode } = req.body;
        let referredBy = undefined;
        if (referrerCode) {
            const referrer = await User.findOne({ referralCode: referrerCode.toUpperCase() });
            if (referrer) {
                referredBy = referrer._id;
                // Award sparks to referrer
                const referralBonus = 50;
                referrer.sparks = (referrer.sparks || 0) + referralBonus;
                await referrer.save();
                // Record transaction for referrer
                await SparkTransaction.create({
                    userId: referrer._id,
                    type: 'referral',
                    amount: referralBonus,
                    balanceAfter: referrer.sparks,
                    description: `Referral bonus for inviting ${given_name}`
                });
            }
        }
        user = await User.create({
            firstName: given_name,
            lastName: family_name,
            email,
            userType,
            password: "", // no password needed for Google accounts
            profileImage: `https://i.pravatar.cc/300?u=${email}`,
            referralCode,
            referredBy,
            sparks: 50 // Signup bonus
        });
        // Record transaction for signup bonus
        await SparkTransaction.create({
            userId: user._id,
            type: 'bonus',
            amount: 50,
            balanceAfter: 50,
            description: 'Welcome bonus for joining Connecta! 🎉'
        });
        const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({ user, token });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
// ===================
// Resend Verification OTP
// ===================
export const resendVerificationOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.user?.id;
        console.log('Resend verification attempt:', { email, userId });
        let user;
        if (userId) {
            user = await User.findById(userId);
        }
        else if (email) {
            user = await User.findOne({ email });
        }
        if (!user) {
            console.log('Resend failed: User not found');
            return res.status(404).json({ message: "User not found" });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }
        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        // Manage OTP record
        await OTP.deleteMany({ email: user.email });
        await OTP.create({ userId: user._id, email: user.email, otp, expiresAt });
        // Send OTP email
        const result = await sendOTPEmail(user.email, otp, user.firstName, 'EMAIL_VERIFICATION', user.preferredLanguage || 'en');
        if (!result.success) {
            console.error('Failed to send verification email:', result.error);
            return res.status(500).json({ message: "Failed to send verification email" });
        }
        console.log('Resend success: Verification code sent to', user.email);
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
        sendWelcomeEmail(user.email, user.firstName, user.preferredLanguage || 'en').catch(console.error);
        // Send Welcome Notification
        // ... (rest of verifyEmail)
        try {
            const { getIO } = await import('../core/utils/socketIO.js');
            const io = getIO();
            await mongoose.model('Notification').create({
                userId: user._id,
                type: 'system',
                title: user.preferredLanguage === 'ha' ? 'Barka da zuwa Connecta!' : 'Welcome to Connecta!',
                message: user.preferredLanguage === 'ha' ? 'An tabbatar da akantinka. Yanzu za ka iya amfani da dukkan abubuwan.' : 'Your account has been verified. You can now access all features.',
                relatedId: user._id,
                relatedType: 'user',
                actorId: null,
                actorName: 'System',
                isRead: false,
            });
            // ... 
            io.to(user._id.toString()).emit('notification:new', {
                title: user.preferredLanguage === 'ha' ? 'Barka da zuwa Connecta!' : 'Welcome to Connecta!',
                message: user.preferredLanguage === 'ha' ? 'An tabbatar da akantinka.' : 'Your account has been verified.',
                type: 'system'
            });
            // ...
            // Push Notification
            notificationService.sendPushNotification(user._id.toString(), user.preferredLanguage === 'ha' ? 'Barka da zuwa Connecta! 🚀' : 'Welcome to Connecta! 🚀', user.preferredLanguage === 'ha' ? 'An tabbatar da akantinka. Barka da zuwa!' : 'Your account has been verified. You can now access all features.', { type: 'system' });
        }
        catch (e) {
            console.warn('Welcome notification error', e);
        }
        // Return updated user
        res.status(200).json({ success: true, message: "Email verified successfully", user });
    }
    catch (err) {
        // ...
    }
};
// ...
// ===================
// Forgot Password - Send OTP
// ===================
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ success: false, message: "Email is required" });
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });
        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        // Manage OTP record
        await OTP.deleteMany({ email });
        await OTP.create({ userId: user._id, email, otp, expiresAt });
        // Send OTP via email
        await sendOTPEmail(email, otp, user.firstName, 'PASSWORD_RESET', user.preferredLanguage || 'en');
        res.status(200).json({ success: true, message: "Password reset code sent to your email" });
    }
    catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, message: "Server error", error: err });
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
// Claim Daily Reward
// ===================
export const claimDailyReward = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId)
            return res.status(401).json({ success: false, message: "Unauthorized" });
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });
        // Check if claimed in last 24 hours
        const now = new Date();
        if (user.lastRewardClaimedAt) {
            const hoursSinceLastClaim = (now.getTime() - new Date(user.lastRewardClaimedAt).getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastClaim < 24) {
                return res.status(400).json({
                    success: false,
                    message: "Reward already claimed today. Come back later!",
                    nextClaimHours: Math.ceil(24 - hoursSinceLastClaim)
                });
            }
        }
        // Give sparks (e.g., 10 sparks)
        const rewardAmount = 10;
        user.sparks = (user.sparks || 0) + rewardAmount;
        user.lastRewardClaimedAt = now;
        await user.save();
        console.log(`[ClaimReward] User ${user._id} claimed reward. New sparks: ${user.sparks}, LastClaim: ${user.lastRewardClaimedAt}`);
        // Record Spark Transaction
        await SparkTransaction.create({
            userId: user._id,
            type: 'daily_reward',
            amount: rewardAmount,
            balanceAfter: user.sparks,
            description: 'Daily login reward'
        });
        res.status(200).json({
            success: true,
            message: `Daily reward claimed! You received ${rewardAmount} sparks.`,
            user: user, // Return full updated user object
            sparks: user.sparks,
            rewardAmount
        });
    }
    catch (err) {
        console.error('Claim daily reward error:', err);
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
// ===================
// Get Spark History
// ===================
export const getSparkHistory = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { limit = 20, page = 1 } = req.query;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const history = await SparkTransaction.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        const total = await SparkTransaction.countDocuments({ userId });
        res.status(200).json({
            success: true,
            data: history,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            }
        });
    }
    catch (err) {
        console.error('Spark history error:', err);
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
// ===================
// Get Spark Stats
// ===================
export const getSparkStats = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Calculate some stats
        const totalEarnedResult = await SparkTransaction.aggregate([
            { $match: { userId: user._id, amount: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalSpentResult = await SparkTransaction.aggregate([
            { $match: { userId: user._id, amount: { $lt: 0 } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        // Calculate current streak
        const dailyRewards = await SparkTransaction.find({
            userId: user._id,
            type: 'daily_reward'
        }).sort({ createdAt: -1 }).limit(30);
        let streak = 0;
        if (dailyRewards.length > 0) {
            let currentDay = new Date();
            currentDay.setHours(0, 0, 0, 0);
            for (let i = 0; i < dailyRewards.length; i++) {
                const rewardDay = new Date(dailyRewards[i].createdAt);
                rewardDay.setHours(0, 0, 0, 0);
                const diffDays = Math.floor((currentDay.getTime() - rewardDay.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays === 0 || diffDays === 1) {
                    streak++;
                    currentDay = rewardDay;
                }
                else {
                    break;
                }
            }
        }
        res.status(200).json({
            success: true,
            data: {
                currentBalance: user.sparks || 0,
                totalEarned: totalEarnedResult[0]?.total || 0,
                totalSpent: Math.abs(totalSpentResult[0]?.total || 0),
                streakDays: streak,
                nextDailyReward: user.lastRewardClaimedAt
                    ? new Date(new Date(user.lastRewardClaimedAt).getTime() + 24 * 60 * 60 * 1000)
                    : new Date()
            }
        });
    }
    catch (err) {
        console.error('Spark stats error:', err);
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};
// ===================
// Update User Profile
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
// ===================
// Update Preferred Language
// ===================
export const updatePreferredLanguage = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { preferredLanguage } = req.body;
        if (!preferredLanguage || !["en", "ha"].includes(preferredLanguage)) {
            return res.status(400).json({
                success: false,
                message: "Valid preferred language (en or ha) is required"
            });
        }
        const user = await User.findByIdAndUpdate(userId, { preferredLanguage }, { new: true }).select("-password");
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
        console.error("Update preferred language error:", err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err
        });
    }
};
// ===================
// Validate Recipient (Search by Email)
// ===================
export const validateRecipient = async (req, res) => {
    try {
        const { email, userId } = req.body;
        const currentUserId = req.user?.id || req.user?._id;
        if (!email && !userId) {
            return res.status(400).json({ success: false, message: "Email or User ID is required" });
        }
        let query = {};
        if (email) {
            query = { email: email.toLowerCase() };
        }
        else if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ success: false, message: "Invalid User ID format" });
            }
            query = { _id: userId };
        }
        const recipient = await User.findOne(query).select('firstName lastName email profileImage');
        if (!recipient) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (recipient._id.toString() === currentUserId.toString()) {
            return res.status(400).json({ success: false, message: "You cannot send Sparks to yourself" });
        }
        res.status(200).json({
            success: true,
            data: {
                id: recipient._id,
                name: `${recipient.firstName} ${recipient.lastName}`,
                email: recipient.email,
                profileImage: recipient.profileImage
            }
        });
    }
    catch (err) {
        console.error('Validate recipient error:', err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
// ===================
// Set Transaction PIN
// ===================
export const setTransactionPin = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { pin } = req.body;
        if (!pin || pin.length !== 4 || isNaN(parseInt(pin))) {
            return res.status(400).json({ success: false, message: "Invalid 4-digit PIN" });
        }
        const hashedPin = await bcrypt.hash(pin, 10);
        await User.findByIdAndUpdate(userId, { transactionPin: hashedPin });
        res.status(200).json({ success: true, message: "Transaction PIN set successfully" });
    }
    catch (err) {
        console.error('Set transaction PIN error:', err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
// ===================
// Check if User has PIN
// ===================
export const checkHasPin = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const user = await User.findById(userId).select('+transactionPin');
        res.status(200).json({
            success: true,
            hasPin: !!user?.transactionPin
        });
    }
    catch (err) {
        console.error('Check has PIN error:', err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
// ===================
// Transfer Sparks
// ===================
export const transferSparks = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const senderId = req.user?.id || req.user?._id;
        const { recipientEmail, amount, pin } = req.body;
        if (!recipientEmail || !amount || !pin) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const sparkAmount = parseInt(amount);
        if (isNaN(sparkAmount) || sparkAmount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }
        // 1. Verify Sender and PIN
        const sender = await User.findById(senderId).select('+transactionPin').session(session);
        if (!sender)
            throw new Error("Sender not found");
        if (!sender.transactionPin) {
            return res.status(400).json({ success: false, message: "Transaction PIN not set" });
        }
        const isPinValid = await bcrypt.compare(pin, sender.transactionPin);
        if (!isPinValid) {
            return res.status(401).json({ success: false, message: "Invalid transaction PIN" });
        }
        // 2. Check Balance
        if (sender.sparks < sparkAmount) {
            return res.status(400).json({ success: false, message: "Insufficient Spark balance" });
        }
        // 3. Verify Recipient
        const recipient = await User.findOne({ email: recipientEmail.toLowerCase() }).session(session);
        if (!recipient) {
            return res.status(404).json({ success: false, message: "Recipient not found" });
        }
        if (recipient._id.toString() === senderId.toString()) {
            return res.status(400).json({ success: false, message: "Cannot transfer to yourself" });
        }
        // 4. Perform Transfer
        sender.sparks -= sparkAmount;
        recipient.sparks += sparkAmount;
        await sender.save({ session });
        await recipient.save({ session });
        // 5. Record Transactions
        await SparkTransaction.create([{
                userId: sender._id,
                type: 'transfer_send',
                amount: -sparkAmount,
                balanceAfter: sender.sparks,
                description: `Sent Sparks to ${recipient.firstName} ${recipient.lastName}`,
                metadata: { recipientId: recipient._id, recipientEmail: recipient.email }
            }], { session });
        await SparkTransaction.create([{
                userId: recipient._id,
                type: 'transfer_receive',
                amount: sparkAmount,
                balanceAfter: recipient.sparks,
                description: `Received Sparks from ${sender.firstName} ${sender.lastName}`,
                metadata: { senderId: sender._id, senderEmail: sender.email }
            }], { session });
        // 6. Notifications
        try {
            notificationService.sendPushNotification(recipient._id.toString(), "Sparks Received! ✨", `You received ${sparkAmount} Sparks from ${sender.firstName}.`, { type: 'spark_transfer', senderId: sender._id.toString() });
        }
        catch (notificationError) {
            console.warn("Failed to send transfer notification", notificationError);
        }
        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: "Transfer successful",
            newBalance: sender.sparks
        });
    }
    catch (err) {
        await session.abortTransaction();
        console.error('Transfer Sparks error:', err);
        res.status(500).json({ success: false, message: err.message || "Transfer failed" });
    }
    finally {
        session.endSession();
    }
};
