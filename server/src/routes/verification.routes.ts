import express from "express";
import {
    submitVerification,
    getVerificationStatus,
    getAllVerifications,
    updateVerificationStatus
} from "../controllers/Verification.controller.js";
import { authenticate } from "../core/middleware/auth.middleware.js";
import { isAdmin } from "../core/middleware/admin.middleware.js";
import { upload } from "../core/utils/fileUpload.js";

const router = express.Router();

// User routes
router.post(
    "/submit",
    authenticate,
    upload.fields([
        { name: 'idFrontImage', maxCount: 1 },
        { name: 'idBackImage', maxCount: 1 },
        { name: 'selfieImage', maxCount: 1 }
    ]),
    submitVerification
);
router.get("/status", authenticate, getVerificationStatus);

// Admin routes
router.get("/all", authenticate, isAdmin, getAllVerifications);
router.put("/:id/status", authenticate, isAdmin, updateVerificationStatus);

export default router;
