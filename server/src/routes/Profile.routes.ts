import express from "express";
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
  getMyProfile,
} from "../controllers/Profile.controller";
import { authenticate } from "../core/middleware/auth.middleware";

const router = express.Router();

router.post("/", createProfile);
router.get("/", getAllProfiles);
// Get profile for authenticated user
router.get("/me", authenticate, getMyProfile);
router.get("/:id", getProfileById);
router.put("/:id", updateProfile);
router.delete("/:id", deleteProfile);

export default router;
