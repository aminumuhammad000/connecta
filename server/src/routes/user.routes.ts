import express from "express";
import { signup, signin, googleSignup, googleSignin, getUsers, getUserById } from "../controllers/user.controller";

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google/signup", googleSignup);
router.post("/google/signin", googleSignin);

// User data routes
router.get("/", getUsers); // GET /api/users?userType=freelancer&skills=React&limit=20
router.get("/:id", getUserById); // GET /api/users/:id

export default router;
