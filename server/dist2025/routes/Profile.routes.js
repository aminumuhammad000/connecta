import express from "express";
import { createProfile, getAllProfiles, getProfileById, getProfileByUserId, updateProfile, deleteProfile, getMyProfile, updateMyProfile, parseResume, downloadResume, } from "../controllers/Profile.controller.js";
import { authenticate } from "../core/middleware/auth.middleware.js";
import multer from 'multer';
// Use memory storage for resume parsing (no need to save to disk/cloud)
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
router.post("/", createProfile);
router.post("/parse-resume", authenticate, upload.single('resume'), parseResume);
router.get("/me/resume/pdf", authenticate, downloadResume);
router.get("/", getAllProfiles);
// Get profile for authenticated user
router.get("/me", authenticate, getMyProfile);
// Update profile for authenticated user
// Update profile for authenticated user
router.put("/me", authenticate, updateMyProfile);
router.get("/user/:userId", getProfileByUserId);
router.get("/:id", getProfileById);
router.put("/:id", updateProfile);
router.delete("/:id", deleteProfile);
export default router;
