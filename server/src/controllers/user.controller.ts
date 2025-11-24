import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID as string);

// ===================
// Get All Users / Search Users
// ===================
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { userType, skills, limit = 50 } = req.query;

    const query: any = {};

    if (userType) {
      query.userType = userType;
    }

    if (skills) {
      query.skills = { $in: [skills] };
    }

    const users = await User.find(query)
      .select('-password') // Exclude password
      .limit(parseInt(limit as string));

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
// Local Sign Up
// ===================
export const signup = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, userType } = req.body;

    console.log('Signup attempt:', { firstName, lastName, email, userType });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userType,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ===================
// Local Sign In
// ===================
export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    res.status(200).json({ user, token });
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
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    res.status(201).json({ user, token });
  } catch (err) {
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ===================
// Forgot Password - Send OTP
// ===================
export const forgotPassword = async (req: Request, res: Response) => {
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
  } catch (err) {
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
export const verifyOTP = async (req: Request, res: Response) => {
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
    const resetToken = jwt.sign(
      { userId: user._id, otpId: otpRecord._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken
    });
  } catch (err) {
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
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err
    });
  }
};

