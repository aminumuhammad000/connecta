"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfile = exports.deleteProfile = exports.updateProfile = exports.getProfileById = exports.getMyProfile = exports.getAllProfiles = exports.createProfile = void 0;
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
/**
 * @desc Create a new profile
 * @route POST /api/profiles
 */
const createProfile = async (req, res) => {
    try {
        const { user, phoneNumber, location, resume, education, languages, employment } = req.body;
        // Ensure user exists
        const existingUser = await user_model_1.default.findById(user);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // Prevent duplicate profile for same user
        const existingProfile = await Profile_model_1.default.findOne({ user });
        if (existingProfile) {
            return res.status(400).json({ message: "Profile already exists for this user" });
        }
        const profile = new Profile_model_1.default({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createProfile = createProfile;
/**
 * @desc Get all profiles
 * @route GET /api/profiles
 */
const getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile_model_1.default.find().populate("user", "firstName lastName email userType");
        res.status(200).json(profiles);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllProfiles = getAllProfiles;
/**
 * @desc Get profile for authenticated user
 * @route GET /api/profiles/me
 */
const Job_model_1 = __importDefault(require("../models/Job.model"));
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        let profile = await Profile_model_1.default.findOne({ user: userId }).populate('user', 'firstName lastName email profileImage userType isPremium subscriptionTier subscriptionStatus premiumExpiryDate');
        // Auto-create profile if it doesn't exist
        if (!profile) {
            profile = await Profile_model_1.default.create({
                user: userId,
                bio: '',
                skills: [],
                phoneNumber: '',
                location: '',
            });
            // Populate user data
            profile = await Profile_model_1.default.findById(profile._id).populate('user', 'firstName lastName email profileImage userType isPremium subscriptionTier subscriptionStatus premiumExpiryDate');
        }
        // Fetch jobs posted by this client
        const jobs = await Job_model_1.default.find({ clientId: userId }).sort({ createdAt: -1 });
        const jobsPosted = jobs.length;
        // Convert to plain object and add extra data
        const profileData = profile.toObject();
        // Extract user data from populated field
        const userData = (profileData.user || {});
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
            // Additional data
            jobs,
            jobsPosted,
            totalSpend: 0,
            avgRate: 0,
        };
        console.log('📤 Profile fields:', {
            phoneNumber: responseData.phoneNumber,
            location: responseData.location,
            companyName: responseData.companyName,
            bio: responseData.bio,
            avatar: responseData.avatar
        });
        res.status(200).json(responseData);
    }
    catch (error) {
        console.error('Error in getMyProfile:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getMyProfile = getMyProfile;
/**
 * @desc Get profile by ID
 * @route GET /api/profiles/:id
 */
const getProfileById = async (req, res) => {
    try {
        const profile = await Profile_model_1.default.findById(req.params.id).populate("user", "firstName lastName email userType");
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.status(200).json(profile);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProfileById = getProfileById;
/**
 * @desc Update profile
 * @route PUT /api/profiles/:id
 */
const updateProfile = async (req, res) => {
    try {
        const { phoneNumber, location, resume, education, languages, employment } = req.body;
        const updatedProfile = await Profile_model_1.default.findByIdAndUpdate(req.params.id, { phoneNumber, location, resume, education, languages, employment }, { new: true, runValidators: true });
        if (!updatedProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.status(200).json(updatedProfile);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateProfile = updateProfile;
/**
 * @desc Delete profile
 * @route DELETE /api/profiles/:id
 */
const deleteProfile = async (req, res) => {
    try {
        const profile = await Profile_model_1.default.findByIdAndDelete(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.status(200).json({ message: "Profile deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteProfile = deleteProfile;
/**
 * @desc Update current user's profile
 * @route PUT /api/profiles/me
 */
const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { phoneNumber, location, companyName, website, bio, avatar, skills, education, languages, employment, resume } = req.body;
        console.log('📝 Update profile request:', { phoneNumber, location, companyName, website, bio, avatar });
        // Prepare update data
        const updateData = {};
        if (phoneNumber !== undefined)
            updateData.phoneNumber = phoneNumber;
        if (location !== undefined)
            updateData.location = location;
        if (companyName !== undefined)
            updateData.companyName = companyName;
        if (website !== undefined)
            updateData.website = website;
        if (bio !== undefined)
            updateData.bio = bio;
        if (avatar !== undefined)
            updateData.avatar = avatar;
        if (skills !== undefined)
            updateData.skills = skills;
        if (education !== undefined)
            updateData.education = education;
        if (languages !== undefined)
            updateData.languages = languages;
        if (employment !== undefined)
            updateData.employment = employment;
        if (resume !== undefined)
            updateData.resume = resume;
        console.log('💾 Data to save:', updateData);
        let profile = await Profile_model_1.default.findOne({ user: userId });
        if (!profile) {
            // Create profile if it doesn't exist
            profile = await Profile_model_1.default.create({
                user: userId,
                ...updateData
            });
            console.log('✅ Profile created:', profile);
        }
        else {
            // Update existing profile
            profile = await Profile_model_1.default.findOneAndUpdate({ user: userId }, updateData, { new: true, runValidators: true }).populate('user', 'firstName lastName email profileImage userType');
            console.log('✅ Profile updated:', profile);
        }
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: profile
        });
    }
    catch (error) {
        console.error('Update my profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.updateMyProfile = updateMyProfile;
