import { Request, Response } from "express";
import Profile from "../models/Profile.model.js";
import User from "../models/user.model.js";
import Review from "../models/Review.model.js";

/**
 * @desc Create a new profile
 * @route POST /api/profiles
 */
export const createProfile = async (req: Request, res: Response) => {
  try {
    const { user, phoneNumber, location, resume, education, languages, employment } = req.body;

    // Ensure user exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent duplicate profile for same user
    const existingProfile = await Profile.findOne({ user });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists for this user" });
    }

    const profile = new Profile({
      user,
      phoneNumber,
      location,
      resume,
      education,
      languages,
      employment,
    });

    const savedProfile = await profile.save();
    res.status(201).json(savedProfile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all profiles
 * @route GET /api/profiles
 */
export const getAllProfiles = async (req: Request, res: Response) => {
  try {
    const profiles = await Profile.find().populate("user", "firstName lastName email userType");
    res.status(200).json(profiles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Helper to format profile response consistently
 */
const formatProfileResponse = (profile: any, reviews: any[] = [], jobs: any[] = []) => {
  const profileData = profile.toObject ? profile.toObject() : profile;
  const userData = (profileData.user || {}) as any;

  return {
    _id: profileData._id,
    userId: userData._id || profileData.user,
    phoneNumber: profileData.phoneNumber,
    location: profileData.location,
    country: profileData.country,
    city: profileData.city,
    timezone: profileData.timezone,
    preferredLanguage: profileData.preferredLanguage,
    skills: profileData.skills || [],
    companyName: profileData.companyName,
    website: profileData.website,
    bio: profileData.bio,
    avatar: profileData.avatar || userData.profileImage,
    profileImage: userData.profileImage || profileData.avatar,
    education: profileData.education || [],
    languages: profileData.languages || [],
    employment: profileData.employment || [],
    portfolio: profileData.portfolio || [],
    resume: profileData.resume,
    createdAt: profileData.createdAt,
    updatedAt: profileData.updatedAt,

    // User fields flattened for frontend convenience
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    userType: userData.userType,
    isPremium: userData.isPremium,
    subscriptionTier: userData.subscriptionTier,
    subscriptionStatus: userData.subscriptionStatus,
    premiumExpiryDate: userData.premiumExpiryDate,

    // Reputation / Stats
    averageRating: userData.averageRating || 0,
    totalReviews: userData.totalReviews || 0,
    jobSuccessScore: userData.jobSuccessScore || 0,
    badges: userData.badges || [],
    performanceMetrics: userData.performanceMetrics || {
      onTimeDeliveryRate: 100,
      completionRate: 100,
      responseTime: 24,
    },

    // Additional data
    jobs,
    jobsPosted: jobs.length,
    reviews,
    totalSpend: 0,
    avgRate: 0,

    // Preferences
    remoteWorkType: profileData.remoteWorkType,
    minimumSalary: profileData.minimumSalary,
    workLocationPreferences: profileData.workLocationPreferences,
    jobTitle: profileData.jobTitle,
    profession: profileData.jobTitle || 'Freelancer', // Map jobTitle to profession for frontend
    jobCategories: profileData.jobCategories,
    yearsOfExperience: profileData.yearsOfExperience,
    engagementTypes: profileData.engagementTypes,
    jobNotificationFrequency: profileData.jobNotificationFrequency,
  };
};

import { Job } from "../models/Job.model.js";

export const getMyProfile = async (
  req: Request & { user?: { id?: string; _id?: string } },
  res: Response
) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    let profile = await Profile.findOne({ user: userId }).populate(
      'user',
      'firstName lastName email profileImage userType isPremium subscriptionTier subscriptionStatus premiumExpiryDate averageRating totalReviews jobSuccessScore badges performanceMetrics'
    );

    // Auto-create profile if it doesn't exist
    if (!profile) {
      profile = await Profile.create({
        user: userId,
        bio: '',
        skills: [],
        phoneNumber: '',
        location: '',
      });

      // Populate user data
      profile = await Profile.findById(profile._id).populate(
        'user',
        'firstName lastName email profileImage userType isPremium subscriptionTier subscriptionStatus premiumExpiryDate'
      );
    }

    // Fetch jobs posted by this client
    const jobs = await Job.find({ clientId: userId }).sort({ createdAt: -1 });
    const jobsPosted = jobs.length;

    // Fetch reviews for this user
    const reviews = await Review.find({
      revieweeId: userId,
      isPublic: true,
      isFlagged: false
    })
      .sort({ createdAt: -1 })
      .populate('reviewerId', 'firstName lastName profileImage')
      .populate('projectId', 'title');

    const responseData = formatProfileResponse(profile, reviews, jobs);

    console.log('📤 Profile fields:', {
      phoneNumber: responseData.phoneNumber,
      location: responseData.location,
      bio: responseData.bio,
      avatar: responseData.avatar
    });

    res.status(200).json(responseData);
  } catch (error: any) {
    console.error('Error in getMyProfile:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get profile by ID
 * @route GET /api/profiles/:id
 */
/**
 * @desc Get profile by ID
 * @route GET /api/profiles/:id
 */
export const getProfileById = async (req: Request, res: Response) => {
  try {
    const profile = await Profile.findById(req.params.id).populate(
      "user",
      "firstName lastName email profileImage userType isPremium subscriptionTier subscriptionStatus premiumExpiryDate averageRating totalReviews jobSuccessScore badges performanceMetrics"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Fetch reviews
    const reviews = await Review.find({
      revieweeId: (profile.user as any)._id,
      isPublic: true,
      isFlagged: false
    })
      .sort({ createdAt: -1 })
      .populate('reviewerId', 'firstName lastName profileImage')
      .populate('projectId', 'title');

    const responseData = formatProfileResponse(profile, reviews);
    res.status(200).json(responseData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get profile by User ID
 * @route GET /api/profiles/user/:userId
 */
export const getProfileByUserId = async (req: Request, res: Response) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate(
      "user",
      "firstName lastName email profileImage userType isPremium subscriptionTier subscriptionStatus premiumExpiryDate averageRating totalReviews jobSuccessScore badges performanceMetrics"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Fetch reviews
    // Fetch reviews
    const revieweeId = (profile.user as any)._id;
    console.log('Fetching reviews for revieweeId:', revieweeId);

    const reviews = await Review.find({
      revieweeId: revieweeId,
      isPublic: true,
      isFlagged: false
    })
      .sort({ createdAt: -1 })
      .populate('reviewerId', 'firstName lastName profileImage')
      .populate('projectId', 'title');

    console.log('Found reviews:', reviews.length);

    // Fetch jobs posted by this user (if client)
    const jobs = await Job.find({ clientId: req.params.userId }).sort({ createdAt: -1 });

    const responseData = formatProfileResponse(profile, reviews, jobs);
    res.status(200).json(responseData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update profile
 * @route PUT /api/profiles/:id
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, location, resume, education, languages, employment } = req.body;

    const updatedProfile = await Profile.findByIdAndUpdate(
      req.params.id,
      { phoneNumber, location, resume, education, languages, employment },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(updatedProfile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Delete profile
 * @route DELETE /api/profiles/:id
 */
export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update current user's profile
 * @route PUT /api/profiles/me
 */
export const updateMyProfile = async (
  req: Request & { user?: { id?: string; _id?: string } },
  res: Response
) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const {
      phoneNumber, location, country, city, timezone, preferredLanguage, companyName, website, bio, avatar, skills,
      education, languages, employment, resume, portfolio,
      remoteWorkType, minimumSalary, workLocationPreferences, jobTitle,
      jobCategories, yearsOfExperience, engagementTypes, jobNotificationFrequency
    } = req.body;

    console.log('📝 Update profile request:', { phoneNumber, location, country, city, timezone, preferredLanguage, bio, avatar });

    // Prepare update data
    const updateData: any = {};
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (location !== undefined) updateData.location = location;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (preferredLanguage !== undefined) updateData.preferredLanguage = preferredLanguage;
    if (website !== undefined) updateData.website = website;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (skills !== undefined) updateData.skills = skills;
    if (education !== undefined) updateData.education = education;
    if (languages !== undefined) updateData.languages = languages;
    if (employment !== undefined) updateData.employment = employment;
    if (resume !== undefined) updateData.resume = resume;
    if (portfolio !== undefined) updateData.portfolio = portfolio;
    if (remoteWorkType !== undefined) updateData.remoteWorkType = remoteWorkType;
    if (minimumSalary !== undefined) updateData.minimumSalary = minimumSalary;
    if (workLocationPreferences !== undefined) updateData.workLocationPreferences = workLocationPreferences;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (jobCategories !== undefined) updateData.jobCategories = jobCategories;
    if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
    if (engagementTypes !== undefined) updateData.engagementTypes = engagementTypes;
    if (jobNotificationFrequency !== undefined) updateData.jobNotificationFrequency = jobNotificationFrequency;

    console.log('💾 Data to save:', updateData);

    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await Profile.create({
        user: userId,
        ...updateData
      });
      console.log('✅ Profile created:', profile);
    } else {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: userId },
        updateData,
        { new: true, runValidators: true }
      ).populate('user', 'firstName lastName email profileImage userType');
      console.log('✅ Profile updated:', profile);
    }

    // Sync with User model if avatar or names were updated
    const userUpdate: any = {};
    if (avatar) userUpdate.profileImage = avatar;

    // Extract names from request body (they are not in profile schema but passed from frontend)
    const { firstName, lastName } = req.body;
    if (firstName) userUpdate.firstName = firstName;
    if (lastName) userUpdate.lastName = lastName;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdate);
      console.log('🔄 Synced User model fields:', userUpdate);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error: any) {
    console.error('Update my profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @ts-ignore
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import LLMService from '../services/LLM.service.js';

/**
 * @desc Parse resume and return structured data
 * @route POST /api/profiles/parse-resume
 */
export const parseResume = async (req: Request, res: Response) => {
  try {
    console.log('📥 Incoming parse-resume request');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('File:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer
    } : 'None');

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        message: "No resume file uploaded",
        debug: {
          contentType: req.headers['content-type'],
          hasFile: !!req.file,
          bodyKeys: Object.keys(req.body || {})
        }
      });
    }

    // Extract text from PDF
    console.log('📄 Parsing PDF Resume...');

    // pdf-parse v2 usage
    // @ts-ignore
    const pdfLib = require('pdf-parse');
    const PDFParse = pdfLib.PDFParse || pdfLib.default?.PDFParse || pdfLib;

    // Validate constructor
    if (typeof PDFParse !== 'function') {
      throw new Error(`PDFParse library not loaded correctly. Type: ${typeof PDFParse}`);
    }

    // Check if buffer exists
    if (!req.file || !req.file.buffer) {
      throw new Error("File buffer is empty");
    }

    // pdf-parse v2 constructor expects a buffer directly or an object?
    // Based on user's previous code it was object. Let's try standard buffer first as per v2 pattern if possible, 
    // or checks docs. But since I can't check docs, I will trust the previous code slightly but add try/catch.
    // Actually, safely try both or just pass the buffer?
    // Let's assume `new PDFParse(buffer)` or `new PDFParse({data: buffer})`
    // I will try to use the library as intended by v2.
    // Wait, let's look at the CJS test output first.

    // Instantiate parser with correct signature
    // pdf-parse v2 expects object with 'data' property
    const parser = new PDFParse({ data: req.file.buffer });
    const data = await parser.getText();
    const text = data.text;

    // Log the first 200 chars to debug
    console.log('📄 Extracted PDF Text Sample:', text.substring(0, 200) + '...');

    if (!text || text.length < 50) {
      return res.status(400).json({ message: "Could not extract text from resume" });
    }

    console.log(`🤖 Extracted ${text.length} chars. sending to AI...`);

    // Parse with AI
    const profileData = await LLMService.parseResumeText(text);

    console.log('✅ AI Parse Success');

    res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error: any) {
    console.error('Resume Parse Error:', error);
    // Write error to file for debugging
    const fs = require('fs');
    fs.writeFileSync('debug_error.txt', `Time: ${new Date().toISOString()}\nError: ${error.message}\nStack: ${error.stack}\n\n`);

    res.status(500).json({ message: "Failed to parse resume: " + error.message });
  }
};

import PDFGenerationService from '../services/PDFGeneration.service.js';

/**
 * @desc Generate and download PDF resume
 * @route GET /api/profiles/me/resume/pdf
 */
export const downloadResume = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;

    // Fetch full profile data
    const profile = await Profile.findOne({ user: userId }).populate('user', 'firstName lastName email phoneNumber');

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Generate PDF
    const pdfBuffer = await PDFGenerationService.generateResumePDF(profile);

    // Send as download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Connecta_Resume.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    });

    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ message: "Failed to generate resume" });
  }
};
