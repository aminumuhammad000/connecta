import { Request, Response } from "express";
import Verification from "../models/Verification.model.js";
import User from "../models/user.model.js";
import SparkTransaction from "../models/SparkTransaction.model.js";

export const submitVerification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id; // Assuming auth middleware sets req.user
    const { idType, idNumber, fullName, dateOfBirth } = req.body;

    // Check if there's already a pending or approved verification
    const existingVerification = await Verification.findOne({ user: userId });
    if (existingVerification && (existingVerification.status === "pending" || existingVerification.status === "approved")) {
      return res.status(400).json({
        message: `You already have a ${existingVerification.status} verification request.`,
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Enforce spark charge for verification
    const VERIFICATION_CHARGE = 500;
    if ((user.sparks || 0) < VERIFICATION_CHARGE) {
      return res.status(400).json({
        success: false,
        message: `Insufficient sparks. Verification requires ${VERIFICATION_CHARGE} sparks. You currently have ${user.sparks || 0}.`
      });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files['idFrontImage']) {
      return res.status(400).json({ message: "ID Front Image is required" });
    }

    // Sanitize dateOfBirth: Mongoose fails if you pass an empty string to a Date field
    const sanitizedBirthDate = (dateOfBirth && dateOfBirth.trim() !== "") ? new Date(dateOfBirth) : undefined;

    const verificationData = {
      user: userId,
      idType,
      idNumber,
      fullName,
      dateOfBirth: sanitizedBirthDate,
      idFrontImage: files['idFrontImage'][0].path,
      idBackImage: files['idBackImage'] ? files['idBackImage'][0].path : undefined,
      selfieImage: files['selfieImage'] ? files['selfieImage'][0].path : undefined,
      status: "pending",
    };

    if (existingVerification && existingVerification.status === "rejected") {
      await Verification.findByIdAndUpdate(existingVerification._id, verificationData);
      return res.status(200).json({ message: "Verification request resubmitted successfully" });
    }

    const newVerification = new Verification(verificationData);
    await newVerification.save();

    // Deduct sparks
    user.sparks -= VERIFICATION_CHARGE;
    await user.save();

    // Record transaction
    await SparkTransaction.create({
      userId: user._id,
      type: 'spend',
      amount: -VERIFICATION_CHARGE,
      balanceAfter: user.sparks,
      description: 'Account verification fee'
    });

    res.status(201).json({
      message: "Verification request submitted successfully",
      verification: newVerification,
    });
  } catch (error: any) {
    console.error("Verification Submission Error:", error);
    res.status(500).json({
      message: error.name === 'ValidationError' ? "Please check your ID information format." : "Internal server error occurred during submission.",
      details: error.message
    });
  }
};

export const getVerificationStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const verification = await Verification.findOne({ user: userId });

    if (!verification) {
      return res.status(404).json({ message: "No verification request found" });
    }

    res.status(200).json(verification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin handlers
export const getAllVerifications = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const verifications = await Verification.find(query).populate("user", "firstName lastName email");
    res.status(200).json(verifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVerificationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const verification = await Verification.findById(id);
    if (!verification) {
      return res.status(404).json({ message: "Verification request not found" });
    }

    verification.status = status;
    verification.adminNotes = adminNotes;
    await verification.save();

    if (status === "approved") {
      // Update user status and add badge
      const user = await User.findById(verification.user);
      if (user) {
        user.isVerified = true;
        if (!user.badges.includes("verified_pro")) {
          user.badges.push("verified_pro");
        }

        // Award sparks for successful verification
        const VERIFICATION_REWARD = 100;
        user.sparks = (user.sparks || 0) + VERIFICATION_REWARD;

        await user.save();

        // Record transaction
        await SparkTransaction.create({
          userId: user._id,
          type: 'bonus',
          amount: VERIFICATION_REWARD,
          balanceAfter: user.sparks,
          description: 'Identity verification successful reward'
        });
      }
    } else {
      // If rejected, maybe we should keep isVerified as false (default)
      const user = await User.findById(verification.user);
      if (user) {
        user.isVerified = false;
        // Optionally remove badge if it was there
        user.badges = user.badges.filter(b => b !== "verified_pro");
        await user.save();
      }
    }

    res.status(200).json({
      message: `Verification ${status} successfully`,
      verification,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
