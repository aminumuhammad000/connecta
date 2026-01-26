import express from "express";
import { createProfile, getAllProfiles, getProfileById, getProfileByUserId, updateProfile, deleteProfile, getMyProfile, updateMyProfile, } from "../controllers/Profile.controller";
import { authenticate } from "../core/middleware/auth.middleware";
const router = express.Router();
router.post("/", createProfile);
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
