import express from "express";
import {
    signup, initiateSignup, signin, googleSignup, googleSignin,
    getUsers, getFreelancers, getUserById, forgotPassword,
    verifyOTP, resetPassword, banUser, unbanUser, 
    getMe, verifyEmail, resendVerificationOTP,
    updatePushToken, changePassword, checkEmailExists, checkPhoneExists,
    updateMe, deleteUser, createAdmin, bulkDeleteUsers, bulkBanUsers, bulkUnbanUsers, updateUserById
} from "../controllers/user.controller.js";
import { authenticate } from "../core/middleware/auth.middleware.js";
import { isAdmin } from "../core/middleware/admin.middleware.js";

const router = express.Router();

// Auth routes
router.post("/check-email", checkEmailExists);
router.post("/check-phone", checkPhoneExists);
router.post("/initiate-signup", initiateSignup);
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google/signup", googleSignup);
router.post("/google/signin", googleSignin);

// Password recovery routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// Current user routes (protected)
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);
router.post("/verify-email", authenticate, verifyEmail);
router.post("/resend-verification", resendVerificationOTP);
router.post("/push-token", authenticate, updatePushToken);
router.post("/change-password", authenticate, changePassword);
// router.post("/switch-type", authenticate, switchUserType); // Missing in controller
// router.post("/preferred-language", authenticate, updatePreferredLanguage); // Missing in controller
// router.post("/claim-reward", authenticate, claimDailyReward); // Missing in controller
// router.get("/spark-history", authenticate, getSparkHistory); // Missing in controller
// router.get("/spark-stats", authenticate, getSparkStats); // Missing in controller

// Transaction PIN routes (Must be BEFORE /:id)
// router.post("/transaction-pin", authenticate, setTransactionPin); // Missing in controller
// router.get("/has-transaction-pin", authenticate, checkHasPin); // Missing in controller

// User data routes
router.get("/freelancers", getFreelancers);
router.get("/", getUsers);
router.get("/:id", getUserById);

// User management routes
router.put("/:id", authenticate, isAdmin, updateUserById);
router.put("/:id/ban", authenticate, isAdmin, banUser);
router.put("/:id/unban", authenticate, isAdmin, unbanUser);
router.post("/admin", createAdmin); // Temporarily without auth for initial setup
router.delete("/:id", authenticate, isAdmin, deleteUser);

// Bulk operations (admin only)
router.post("/bulk/delete", authenticate, isAdmin, bulkDeleteUsers);
router.post("/bulk/ban", authenticate, isAdmin, bulkBanUsers);
router.post("/bulk/unban", authenticate, isAdmin, bulkUnbanUsers);

export default router;
