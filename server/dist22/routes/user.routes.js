import express from "express";
import { signup, initiateSignup, signin, googleSignup, googleSignin, getUsers, getFreelancers, getUserById, forgotPassword, verifyOTP, resetPassword, banUser, unbanUser, deleteUser, getMe, updateMe, verifyEmail, resendVerificationOTP, updatePushToken, changePassword, switchUserType, updatePreferredLanguage, checkEmailExists, checkPhoneExists, claimDailyReward, getSparkHistory, getSparkStats } from "../controllers/user.controller.js";
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
router.get("/me", authenticate, getMe); // GET /api/users/me
router.put("/me", authenticate, updateMe); // PUT /api/users/me
router.post("/verify-email", authenticate, verifyEmail); // POST /api/users/verify-email
router.post("/resend-verification", authenticate, resendVerificationOTP); // POST /api/users/resend-verification
router.post("/push-token", authenticate, updatePushToken); // POST /api/users/push-token
router.post("/change-password", authenticate, changePassword); // POST /api/users/change-password
router.post("/switch-type", authenticate, switchUserType); // POST /api/users/switch-type
router.post("/preferred-language", authenticate, updatePreferredLanguage); // POST /api/users/preferred-language
router.post("/claim-reward", authenticate, claimDailyReward); // POST /api/users/claim-reward
router.get("/spark-history", authenticate, getSparkHistory); // GET /api/users/spark-history
router.get("/spark-stats", authenticate, getSparkStats); // GET /api/users/spark-stats
// User data routes
router.get("/freelancers", getFreelancers); // GET /api/users/freelancers (Specific)
router.get("/", getUsers); // GET /api/users?userType=freelancer&skills=React&limit=20
router.get("/:id", getUserById); // GET /api/users/:id
// User management routes
router.put("/:id/ban", banUser); // PUT /api/users/:id/ban
router.put("/:id/unban", unbanUser); // PUT /api/users/:id/unban
router.delete("/:id", deleteUser); // DELETE /api/users/:id
export default router;
