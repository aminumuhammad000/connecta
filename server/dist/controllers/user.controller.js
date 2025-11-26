"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unbanUser = exports.banUser = exports.resetPassword = exports.verifyOTP = exports.forgotPassword = exports.googleSignin = exports.googleSignup = exports.signin = exports.signup = exports.getUserById = exports.getUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const user_model_1 = __importDefault(require("../models/user.model"));
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// ===================
// Get All Users / Search Users
// ===================
const getUsers = async (req, res) => {
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
        const users = await user_model_1.default.find(query)
            .select('-password') // Exclude password
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });
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
exports.getUsers = getUsers;
// ===================
// Get User By ID
// ===================
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await user_model_1.default.findById(id).select('-password');
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
exports.getUserById = getUserById;
// ===================
// Local Sign Up
// ===================
const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, userType } = req.body;
        console.log('Signup attempt:', { firstName, lastName, email, userType });
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await user_model_1.default.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            userType,
        });
        const token = jsonwebtoken_1.default.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({ user: newUser, token });
    }
    catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: "Server error", error: err });
    }
};
exports.signup = signup;
// ===================
// Local Sign In
// ===================
const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_model_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ success: true, user, token });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
exports.signin = signin;
// ===================
// Google Sign Up
// ===================
const googleSignup = async (req, res) => {
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
        let user = await user_model_1.default.findOne({ email });
        if (user)
            return res.status(400).json({ message: "User already exists" });
        user = await user_model_1.default.create({
            firstName: given_name,
            lastName: family_name,
            email,
            userType,
            password: "", // no password needed for Google accounts
        });
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({ user, token });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
exports.googleSignup = googleSignup;
// ===================
// Google Sign In
// ===================
const googleSignin = async (req, res) => {
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
        const user = await user_model_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found, please sign up first" });
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ success: true, user, token });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
exports.googleSignin = googleSignin;
// ===================
// Forgot Password - Send OTP
// ===================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }
        // Check if user exists
        const user = await user_model_1.default.findOne({ email });
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
        const OTP = (await Promise.resolve().then(() => __importStar(require('../models/otp.model')))).default;
        await OTP.deleteMany({ userId: user._id });
        // Create new OTP
        await OTP.create({
            userId: user._id,
            otp,
            expiresAt,
        });
        // Send OTP via email
        const { sendOTPEmail } = await Promise.resolve().then(() => __importStar(require('../services/email.service')));
        const emailSent = await sendOTPEmail(email, otp, user.firstName);
        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP email. Please try again."
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
exports.forgotPassword = forgotPassword;
// ===================
// Verify OTP
// ===================
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }
        // Find user
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // Find OTP
        const OTP = (await Promise.resolve().then(() => __importStar(require('../models/otp.model')))).default;
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
        const resetToken = jsonwebtoken_1.default.sign({ userId: user._id, otpId: otpRecord._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
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
exports.verifyOTP = verifyOTP;
// ===================
// Reset Password
// ===================
const resetPassword = async (req, res) => {
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
            decoded = jsonwebtoken_1.default.verify(resetToken, process.env.JWT_SECRET);
        }
        catch (err) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }
        // Find user
        const user = await user_model_1.default.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // Verify OTP was verified
        const OTP = (await Promise.resolve().then(() => __importStar(require('../models/otp.model')))).default;
        const otpRecord = await OTP.findById(decoded.otpId);
        if (!otpRecord || !otpRecord.verified) {
            return res.status(400).json({
                success: false,
                message: "Invalid reset token"
            });
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
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
exports.resetPassword = resetPassword;
// ===================
// Ban User
// ===================
const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await user_model_1.default.findById(id);
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
exports.banUser = banUser;
// ===================
// Unban User
// ===================
const unbanUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await user_model_1.default.findById(id);
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
exports.unbanUser = unbanUser;
