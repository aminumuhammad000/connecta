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
export const getMyProfile = async (
  req: Request & { user?: { id?: string; _id?: string } },
  res: Response
) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const profile = await Profile.findOne({ user: userId }).populate(
      'user',
      'firstName lastName email profileImage userType'
    );

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get profile by ID
 * @route GET /api/profiles/:id
 */
export const getProfileById = async (req: Request, res: Response) => {
  try {
    const profile = await Profile.findById(req.params.id).populate("user", "firstName lastName email userType");

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
