import express from "express";
import { signup, signin, googleSignup, googleSignin, getUsers, getUserById, forgotPassword, verifyOTP, resetPassword, banUser, unbanUser, getMe, updateMe } from "../controllers/user.controller";
import { authenticate } from "../core/middleware/auth.middleware";

const router = express.Router();

// Auth routes
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

// User data routes
router.get("/", getUsers); // GET /api/users?userType=freelancer&skills=React&limit=20
router.get("/:id", getUserById); // GET /api/users/:id

// User management routes
router.put("/:id/ban", banUser); // PUT /api/users/:id/ban
router.put("/:id/unban", unbanUser); // PUT /api/users/:id/unban

export default router;
