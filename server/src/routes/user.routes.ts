import express from "express";
import { signup, signin, googleSignup, googleSignin, getUsers, getUserById, forgotPassword, verifyOTP, resetPassword, banUser, unbanUser } from "../controllers/user.controller";
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

// User data routes
router.get("/", getUsers); // GET /api/users?userType=freelancer&skills=React&limit=20
router.get("/:id", getUserById); // GET /api/users/:id

// User management routes
router.put("/:id/ban", banUser); // PUT /api/users/:id/ban
router.put("/:id/unban", unbanUser); // PUT /api/users/:id/unban

export default router;
