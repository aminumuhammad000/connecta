import express from "express";
import coverLetterRoutes from "./CoverLetter.routes";
import gigRoutes from "./Gig.routes";
import userRoutes from "./user.routes";

const router = express.Router();

router.use("/cover-letter", coverLetterRoutes);
router.use("/gigs", gigRoutes);
router.use("/user", userRoutes);

export default router;
