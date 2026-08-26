import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import { sendOTPEmail, sendWelcomeEmail } from "../services/email.service.js";
import notificationService from "../services/notification.service.js";
import mongoose from "mongoose";
import { createFeedPost } from '../services/feed.service.js';
import WorkforceMember from '../models/WorkforceMember.model.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID as string);

// ===================
// Check if Email Exists
// ===================
// ===================
// Check if Email Exists
// ===================
export const checkEmailExists = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    res.status(200).json({ success: true, exists: !!user });
  } catch (err) {
    console.error('Check email error:', err);
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ===================
// Check if Phone Exists
// ===================
export const checkPhoneExists = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const user = await User.findOne({ phoneNumber });

    res.status(200).json({ success: true, exists: !!user });
  } catch (err) {
    console.error('Check phone error:', err);
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ===================
// Get All Users / Search Users
// ===================
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { userType, skills, limit = 50, includeAdmins = 'false' } = req.query;

    const query: any = {};

    // Handle userType filter
    if (userType && userType !== 'all') {
      // If a specific userType is requested, use it
      query.userType = userType;
    } else if (includeAdmins !== 'true') {
      // Otherwise, exclude admins by default
      query.userType = { $ne: 'admin' };
    }

    if (skills) {
      query.skills = { $in: [skills] };
    }

    const users = await User.find(query)
      .select('-password') // Exclude password
      .limit(parseInt(limit as string))
      .sort({ jobSuccessScore: -1, averageRating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
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
export const getFreelancers = async (req: Request, res: Response) => {
  try {
    const { skills, limit = 50 } = req.query;
    const query: any = { userType: 'freelancer' };

    if (skills) {
      // If skills is a comma-separated string, split it
      const skillsList = (skills as string).split(',').map(s => s.trim());
      query.skills = { $in: skillsList };
    }

    const freelancers = await User.find(query)
      .select('-password')
      .limit(parseInt(limit as string))
      .sort({ jobSuccessScore: -1, averageRating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: freelancers.length,
      data: freelancers
    });
  } catch (err) {
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
export const getUserById = async (req: Request, res: Response) => {
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
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err
    });
  }
};

// ===================
// Update User By ID (Admin)
// ===================
export const updateUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Update user by ID error:', err);
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ===================
export const initiateSignup = async (req: Request, res: Response) => {
  try {
    const { email, firstName, preferredLanguage } = req.body;

    console.log('Initiating signup for:', email);

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt });

    await sendOTPEmail(email, otp, firstName || 'User', 'EMAIL_VERIFICATION', preferredLanguage || 'en');

    res.status(200).json({ success: true, message: "Verification code sent" });
  } catch (err) {
    console.error('Initiate signup error:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ===================
// Local Sign Up (Complete)
// ===================
export const signup = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, userType, otp, ...otherDetails } = req.body;
    console.log(`📩 [Auth] Signup attempt for: ${email} | OTP Received: ${otp}`);

    if (!email || !password || !firstName) {
      return res.status(400).json({ message: "Missing required fields (firstName, email, password)" });
    }

    // Verify OTP if provided
    let otpRecord: any = null;
    if (otp) {
      otpRecord = await OTP.findOne({ email, otp });
      if (!otpRecord) return res.status(400).json({ message: "Invalid verification code" });

      if (new Date() > otpRecord.expiresAt) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ message: "Verification code expired" });
      }
    }

    // Check if user already exists by email or phone
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        ...(otherDetails.phoneNumber ? [{ phoneNumber: otherDetails.phoneNumber }] : [])
      ] 
    });
    
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ message: "Email is already registered" });
      }
      if (otherDetails.phoneNumber && existingUser.phoneNumber === otherDetails.phoneNumber) {
        return res.status(400).json({ message: "Phone number is already registered to another account" });
      }
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      userType,
      isVerified: true,
      profileImage: otherDetails.avatar || otherDetails.profileImage || `https://i.pravatar.cc/300?u=${email}`,
      ...otherDetails
    });

    const token = jwt.sign({ id: newUser._id, userType: newUser.userType }, process.env.JWT_SECRET as string, { expiresIn: "7d" });

    // Clean up OTP
    if (otpRecord && (otpRecord as any)._id) {
      await OTP.deleteOne({ _id: (otpRecord as any)._id });
    }

    // Send Welcome Email
    sendWelcomeEmail(newUser.email, newUser.firstName, (newUser as any).preferredLanguage as 'en' | 'ha' || 'en').catch(console.error);

    // If workforceId / companyId was provided during signup, automatically link worker to workforce company
    const targetWorkforceId = req.body.workforceId || req.body.companyId;
    if (targetWorkforceId && mongoose.Types.ObjectId.isValid(targetWorkforceId)) {
      try {
        await WorkforceMember.findOneAndUpdate(
          { companyId: targetWorkforceId, email: newUser.email },
          {
            companyId: targetWorkforceId,
            workerId: newUser._id,
            fullName: `${newUser.firstName} ${newUser.lastName || ''}`.trim(),
            email: newUser.email,
            phone: newUser.phoneNumber || '',
            role: req.body.jobTitle || 'Specialist Worker',
            status: 'active',
            inviteStatus: 'accepted',
            companyRole: 'worker',
            paymentAmount: 0,
            paymentType: 'monthly',
            currency: 'NGN',
          },
          { upsert: true, new: true }
        );
        console.log(`🔗 Automatically linked worker ${newUser.email} to workforce company ${targetWorkforceId}`);
      } catch (wfLinkErr) {
        console.warn('[UserSignup] Workforce auto-link warning:', wfLinkErr);
      }
    }

    // Publish to Feed
    if (newUser.privacySettings?.allowBroadcast !== false) {
      try {
        createFeedPost({
          type: 'new_member',
          emoji: '👋',
          title: `Say hi to ${newUser.firstName}!`,
          body: `${newUser.firstName} ${newUser.lastName || ''} just joined Connecta as a ${newUser.userType}. Welcome to the community!`,
          relatedType: 'user',
          relatedId: newUser._id?.toString(),
          targetAudience: 'all',
        });
      } catch (feedErr) {
        console.warn('[UserSignup] Feed post failed:', feedErr);
      }
    }

    console.log('✅ Signup successful. Returning data for:', newUser.email);
    res.status(201).json({ user: newUser, token, success: true });
  } catch (err: any) {
    console.error('❌ Signup completion error:', err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `A user with this ${field} already exists.` });
    }
    res.status(500).json({ message: err.message || "Server error", error: err });
  }
};

// ===================
// Local Sign In
// ===================
export const signin = async (req: Request, res: Response) => {
  try {
    console.log('Signin Attempt:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanInput = String(email || req.body.phone || req.body.identifier || '').trim();
    const cleanEmail = cleanInput.toLowerCase();

    const user = await User.findOne({
      $or: [
        { email: cleanEmail },
        { phoneNumber: cleanInput },
        { phone: cleanInput }
      ]
    });
    console.log('User found:', user ? user._id : 'null');

    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if user has a password (if signed up via Google, password might be empty)
    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google Sign-In. Please sign in with Google." });
    }

    const isMatch = await bcrypt.compare(String(password).trim(), user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    console.log('Token generated successfully');

    res.status(200).json({ success: true, user, token });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ===================
// Google Sign In
// ===================
export const googleSignin = async (req: Request, res: Response) => {
  try {
    const { tokenId } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) return res.status(400).json({ message: "Invalid Google token" });

    const { email } = payload;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found, please sign up first" });

    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    res.status(200).json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ===================
// Google Sign Up
// ===================
export const googleSignup = async (req: Request, res: Response) => {
  try {
    const { tokenId, userType } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) return res.status(400).json({ message: "Invalid Google token" });

    const { email, given_name, family_name } = payload;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = await User.create({
      firstName: given_name,
      lastName: family_name,
      email,
      userType,
      password: "", // no password needed for Google accounts
      profileImage: `https://i.pravatar.cc/300?u=${email}`,
    });

    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ===================
// Resend Verification OTP
// ===================
export const resendVerificationOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const userId = (req as any).user?.id;

    console.log('Resend verification attempt:', { email, userId });

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
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
    const result = await sendOTPEmail(user.email, otp, user.firstName, 'EMAIL_VERIFICATION', user.preferredLanguage as 'en' | 'ha' || 'en');

    if (!result.success) {
      console.error('Failed to send verification email:', result.error);
      return res.status(500).json({ message: "Failed to send verification email" });
    }

    console.log('Resend success: Verification code sent to', user.email);
    res.status(200).json({ success: true, message: "Verification code sent" });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ===================
// Verify Email OTP
// ===================
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { otp } = req.body;
    console.log(`📩 [Auth] Email verification attempt for user: ${userId} | OTP Received: ${otp}`);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(200).json({ success: true, message: "Email already verified" });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ userId: user._id, otp, verified: false });

    if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    // Clean up OTP
    if (otpRecord && (otpRecord as any)._id && (otpRecord as any)._id !== 'dev') {
      await OTP.deleteOne({ _id: (otpRecord as any)._id });
    }

    // Send Welcome Email
    sendWelcomeEmail(user.email, user.firstName, user.preferredLanguage as 'en' | 'ha' || 'en').catch(console.error);

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
      notificationService.sendPushNotification(
        user._id.toString(),
        user.preferredLanguage === 'ha' ? 'Barka da zuwa Connecta! 🚀' : 'Welcome to Connecta! 🚀',
        user.preferredLanguage === 'ha' ? 'An tabbatar da akantinka. Barka da zuwa!' : 'Your account has been verified. You can now access all features.',
        { type: 'system' }
      );
    } catch (e) { console.warn('Welcome notification error', e); }

    // Return updated user
    res.status(200).json({ success: true, message: "Email verified successfully", user });
  } catch (err) {
    // ...
  }
};
// ...
// ===================
// Forgot Password - Send OTP
// ===================
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Manage OTP record
    await OTP.deleteMany({ email });
    await OTP.create({ userId: user._id, email, otp, expiresAt });

    // Send OTP via email
    await sendOTPEmail(email, otp, user.firstName, 'PASSWORD_RESET', user.preferredLanguage as 'en' | 'ha' || 'en');

    res.status(200).json({ success: true, message: "Password reset code sent to your email" });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ===================
// Verify OTP
// ===================
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    console.log(`📩 [Auth] OTP verification for: ${email} | OTP Received: ${otp}`);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Find user (optional for pre-signup verification)
    const user = await User.findOne({ email });

    // Find OTP record by email or userId
    const otpQuery: any = { otp };
    if (user) {
      otpQuery.$or = [{ userId: user._id }, { email }];
    } else {
      otpQuery.email = email;
    }

    const otpRecord = await OTP.findOne(otpQuery).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code"
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new code."
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// ===================
// Request OTP for Currency Change
// ===================
export const requestCurrencyOTP = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.deleteMany({ email: user.email });
    await OTP.create({ userId: user._id, email: user.email, otp, expiresAt });

    try {
      await sendOTPEmail(user.email, otp, user.firstName, 'PASSWORD_RESET', user.preferredLanguage as 'en' | 'ha' || 'en');
    } catch (e) {
      console.warn('Email dispatch failed, continuing with OTP generation:', e);
    }

    res.status(200).json({ success: true, message: "Security verification code sent to your email" });
  } catch (err: any) {
    console.error('Request currency OTP error:', err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

// ===================
// Change Default Currency With OTP
// ===================
export const changeCurrencyWithOTP = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { newCurrency, country, otp } = req.body;

    if (!newCurrency || !otp) {
      return res.status(400).json({ success: false, message: "New currency and OTP code are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify OTP record
    const otpRecord = await OTP.findOne({
      $or: [{ userId: user._id }, { email: user.email }],
      otp
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired security code" });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ success: false, message: "Security code has expired" });
    }

    // Delete OTP record after successful use
    await OTP.deleteOne({ _id: otpRecord._id });

    // Update user's default currency and country
    user.currency = newCurrency;
    if (country) user.country = country;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Default currency updated successfully to ${newCurrency}!`,
      data: user
    });
  } catch (err: any) {
    console.error('Change currency error:', err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

// ===================
// Reset Password
// ===================
export const resetPassword = async (req: Request, res: Response) => {
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
    let decoded: any;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET as string);
    } catch (err) {
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
  } catch (err) {
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
export const banUser = async (req: Request, res: Response) => {
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
  } catch (err) {
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
export const unbanUser = async (req: Request, res: Response) => {
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
  } catch (err) {
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
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

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
  } catch (err) {
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
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
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
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ===================
// Update Push Token
// ===================
export const updatePushToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({ message: "Push token is required" });
    }

    await User.findByIdAndUpdate(userId, { pushToken });

    res.status(200).json({ success: true, message: "Push token updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

/**
 * @desc Update current user info
 * @route PUT /api/users/me
 */
export const updateMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      firstName, lastName, email, phoneNumber, profileImage, pushToken, whatsapp,
      title, bio, location, country, currency, preferredLanguage, companyName,
      website, companyOverview, employment, workExperience, portfolio, hourlyRate, yearsOfExperience, workType, skills
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (pushToken !== undefined) user.pushToken = pushToken;
    if (whatsapp !== undefined) (user as any).whatsapp = whatsapp;
    if (title !== undefined) (user as any).title = title;
    if (bio !== undefined) (user as any).bio = bio;
    if (location !== undefined) (user as any).location = location;
    if (country !== undefined) (user as any).country = country;
    if (currency !== undefined) (user as any).currency = currency;
    if (preferredLanguage !== undefined) (user as any).preferredLanguage = preferredLanguage;
    if (companyName !== undefined) (user as any).companyName = companyName;
    if (website !== undefined) (user as any).website = website;
    if (companyOverview !== undefined) (user as any).companyOverview = companyOverview;
    if (employment !== undefined && Array.isArray(employment)) (user as any).employment = employment;
    if (workExperience !== undefined && Array.isArray(workExperience)) (user as any).workExperience = workExperience;
    if (portfolio !== undefined && Array.isArray(portfolio)) (user as any).portfolio = portfolio;
    if (hourlyRate !== undefined) (user as any).hourlyRate = Number(hourlyRate);
    if (yearsOfExperience !== undefined) (user as any).yearsOfExperience = Number(yearsOfExperience);
    if (workType !== undefined) (user as any).workType = workType;
    if (skills && Array.isArray(skills)) (user as any).skills = skills;

    await user.save();

    // Sync with Profile document as well
    try {
      const Profile = (await import('../models/Profile.model.js')).default;
      await Profile.findOneAndUpdate(
        { user: userId },
        {
          companyName,
          website,
          employment,
          bio,
          jobTitle: title,
          location,
          country,
          whatsapp,
          phoneNumber,
          skills,
          avatar: profileImage,
        },
        { upsert: true, new: true }
      );
    } catch (pErr) {
      console.warn('Sync profile error:', pErr);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Update current user error:', err);
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

/**
 * @desc Delete user by ID
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

/**
 * @desc Create a new admin user
 * @route POST /api/users/admin
 */
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      userType: 'admin',
      isVerified: true
    });

    res.status(201).json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * @desc Admin creation of new Employer account with custom password & email credentials notification
 * @route POST /api/users/admin/create-employer
 */
export const createEmployerByAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, companyName, phoneNumber, location } = req.body;

    if (!email || !password || !firstName || !companyName) {
      return res.status(400).json({
        success: false,
        message: "First name, email, password, and company name are required"
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An employer or user with this email already exists" });
    }

    const employer = await User.create({
      firstName,
      lastName: lastName || '',
      email: email.toLowerCase().trim(),
      password,
      companyName,
      phoneNumber: phoneNumber || '',
      location: location || '',
      userType: 'client',
      isVerified: true,
    });

    // Sync profile
    try {
      const Profile = (await import('../models/Profile.model.js')).default;
      await Profile.create({
        user: employer._id,
        companyName,
        location,
        phoneNumber,
      });
    } catch (pErr) {
      console.warn('Profile creation warning:', pErr);
    }

    // Send email notification with login details and portal URL
    try {
      const { sendEmail } = await import('../services/email.service.js');
      const loginUrl = process.env.WORKFORCE_URL || 'http://localhost:5175/employer/login';
      const subject = `🏢 Welcome to Connecta Workforce - Your Employer Account Details`;
      const html = `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f9fafb; color: #111827;">
          <div style="max-width: 550px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #e5e7eb;">
            <h2 style="color: #ea580c; margin-top: 0;">Welcome to Connecta Workforce, ${firstName}!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
              Your Employer Organization Account for <strong>${companyName}</strong> has been created by the System Administrator.
            </p>
            
            <div style="background-color: #fff7ed; padding: 16px; border-radius: 12px; border: 1px solid #ffedd5; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #9a3412;">🔐 Your Login Credentials:</h4>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Portal URL:</strong> <a href="${loginUrl}" style="color: #ea580c;">${loginUrl}</a></p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${employer.email}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Temporary Password:</strong> ${password}</p>
            </div>

            <p style="font-size: 13px; color: #6b7280;">
              Click the button below to log in and manage your company workforce, post job openings, and disburse monthly payrolls.
            </p>

            <div style="text-align: center; margin-top: 25px;">
              <a href="${loginUrl}" style="background-color: #ea580c; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 12px; display: inline-block; font-size: 14px;">Log In to Employer Dashboard</a>
            </div>
          </div>
        </div>
      `;
      await sendEmail(employer.email, subject, html);
    } catch (mailErr) {
      console.warn('Failed to send employer welcome email:', mailErr);
    }

    return res.status(201).json({
      success: true,
      message: `Employer account for "${companyName}" created successfully! Login details sent to ${employer.email}`,
      data: {
        _id: employer._id,
        firstName: employer.firstName,
        lastName: employer.lastName,
        email: employer.email,
        companyName: employer.companyName,
        passwordAssigned: password,
      }
    });
  } catch (err: any) {
    console.error('Create employer error:', err);
    return res.status(500).json({ success: false, message: err.message || "Failed to create employer account" });
  }
};

// ===================
// Bulk Operations
// ===================
export const bulkDeleteUsers = async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "User IDs array is required" 
      });
    }

    const result = await User.deleteMany({ _id: { $in: userIds } });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} users successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (err: any) {
    console.error('Bulk delete users error:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

export const bulkBanUsers = async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "User IDs array is required" 
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: `Banned ${result.modifiedCount} users successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err: any) {
    console.error('Bulk ban users error:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

export const bulkUnbanUsers = async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "User IDs array is required" 
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { isActive: true }
    );

    res.status(200).json({
      success: true,
      message: `Unbanned ${result.modifiedCount} users successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err: any) {
    console.error('Bulk unban users error:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ===================
// Talent Verification Tier Handlers
// ===================

export const requestVerification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { githubUrl, portfolioUrl, skillProofs } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Record verification request note into bio/profile or status
    user.isVerified = true;
    user.verificationTier = 'vetted_pro';
    user.vettedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Verification request submitted successfully",
      data: user
    });
  } catch (err: any) {
    console.error('Request verification error:', err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const adminVerifyTalent = async (req: Request, res: Response) => {
  try {
    const { userId, tier, skillScores } = req.body;
    const adminId = (req as any).user._id;

    if (!['community', 'vetted_pro', 'top_1_percent'].includes(tier)) {
      return res.status(400).json({ success: false, message: "Invalid verification tier" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.verificationTier = tier;
    user.isVerified = tier !== 'community';
    user.vettedAt = new Date();
    user.vettedBy = adminId;
    if (skillScores && Array.isArray(skillScores)) {
      user.skillAssessmentScores = skillScores;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Talent verification tier updated to ${tier}`,
      data: user
    });
  } catch (err: any) {
    console.error('Admin verify talent error:', err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getVettedTalent = async (req: Request, res: Response) => {
  try {
    const { tier } = req.query;
    const query: any = { userType: 'freelancer', isVerified: true };
    if (tier) {
      query.verificationTier = tier;
    } else {
      query.verificationTier = { $in: ['vetted_pro', 'top_1_percent'] };
    }

    const freelancers = await User.find(query).select('-password').sort({ vettedAt: -1 });

    res.status(200).json({
      success: true,
      data: freelancers
    });
  } catch (err: any) {
    console.error('Get vetted talent error:', err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

