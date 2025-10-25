import express from "express";
import { signup, signin, googleSignup, googleSignin } from "../controllers/user.controller";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google/signup", googleSignup);
router.post("/google/signin", googleSignin);

export default router;
