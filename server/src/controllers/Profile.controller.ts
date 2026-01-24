import { Request, Response } from "express";
import Profile from "../models/Profile.model";
import User from "../models/user.model";

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
 * @desc Get profile for authenticated user
 * @route GET /api/profiles/me
 */
import { Job } from "../models/Job.model";

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

    // Convert to plain object and add extra data
    const profileData = profile.toObject();

    // Extract user data from populated field
    const userData = (profileData.user || {}) as any;

    // Build response with profile data at top level
    // Don't spread profileData.user to avoid overwriting profile fields
    const responseData = {
      _id: profileData._id,
      userId: profileData.user,
      phoneNumber: profileData.phoneNumber,
      location: profileData.location,
      skills: profileData.skills,
      companyName: profileData.companyName,
      website: profileData.website,
      bio: profileData.bio,
      avatar: profileData.avatar || userData.profileImage,
      profileImage: userData.profileImage || profileData.avatar,
      education: profileData.education,
      languages: profileData.languages,
      employment: profileData.employment,
      portfolio: profileData.portfolio,
      resume: profileData.resume,
      createdAt: profileData.createdAt,
      updatedAt: profileData.updatedAt,
      // User fields for convenience
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      userType: userData.userType,
      isPremium: userData.isPremium,
      subscriptionTier: userData.subscriptionTier,
      subscriptionStatus: userData.subscriptionStatus,
      premiumExpiryDate: userData.premiumExpiryDate,
      // Reputation
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
      jobsPosted,
      totalSpend: 0,
      avgRate: 0,
      // Preferences
      remoteWorkType: profileData.remoteWorkType,
      minimumSalary: profileData.minimumSalary,
      workLocationPreferences: profileData.workLocationPreferences,
      jobTitle: profileData.jobTitle,
      jobCategories: profileData.jobCategories,
      yearsOfExperience: profileData.yearsOfExperience,
      engagementTypes: profileData.engagementTypes,
      jobNotificationFrequency: profileData.jobNotificationFrequency,
    };

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

    res.status(200).json(profile);
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

    res.status(200).json(profile);
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
      phoneNumber, location, companyName, website, bio, avatar, skills,
      education, languages, employment, resume, portfolio,
      remoteWorkType, minimumSalary, workLocationPreferences, jobTitle,
      jobCategories, yearsOfExperience, engagementTypes, jobNotificationFrequency
    } = req.body;

    console.log('📝 Update profile request:', { phoneNumber, location, website, bio, avatar, portfolio });

    // Prepare update data
    const updateData: any = {};
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (location !== undefined) updateData.location = location;
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

    // Sync with User model if avatar was updated
    if (avatar) {
      await User.findByIdAndUpdate(userId, { profileImage: avatar });
      console.log('🔄 Synced avatar to User profileImage');
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
