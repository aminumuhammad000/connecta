import express from "express";
import { signup, initiateSignup, signin, googleSignup, googleSignin, getUsers, getFreelancers, getUserById, forgotPassword, verifyOTP, resetPassword, banUser, unbanUser, deleteUser, getMe, updateMe, verifyEmail, resendVerificationOTP, updatePushToken, changePassword, switchUserType, updatePreferredLanguage, checkEmailExists, checkPhoneExists, claimDailyReward, getSparkHistory, getSparkStats, setTransactionPin, checkHasPin } from "../controllers/user.controller.js";
import { authenticate } from "../core/middleware/auth.middleware.js";
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
router.post("/switch-type", authenticate, switchUserType);
router.post("/preferred-language", authenticate, updatePreferredLanguage);
router.post("/claim-reward", authenticate, claimDailyReward);
router.get("/spark-history", authenticate, getSparkHistory);
router.get("/spark-stats", authenticate, getSparkStats);
// Transaction PIN routes (Must be BEFORE /:id)
router.post("/transaction-pin", authenticate, setTransactionPin);
router.get("/has-transaction-pin", authenticate, checkHasPin);
// User data routes
router.get("/freelancers", getFreelancers);
router.get("/", getUsers);
router.get("/:id", getUserById);
// User management routes
router.put("/:id/ban", banUser);
router.put("/:id/unban", unbanUser);
router.delete("/:id", deleteUser);
export default router;
