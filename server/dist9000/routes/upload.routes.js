import express from "express";
import multer from "multer";
import { uploadFileToDrive } from "../controllers/upload.controller.js";
const router = express.Router();
import { projectStorage } from "../config/cloudinary.config.js";
const upload = multer({ storage: projectStorage });
router.post("/upload", upload.single("file"), uploadFileToDrive);
export default router;
