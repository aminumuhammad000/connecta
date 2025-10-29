import express from "express";
import multer from "multer";
import { uploadFileToDrive } from "../controllers/upload.controller";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temporary folder

router.post("/upload", upload.single("file"), uploadFileToDrive);

export default router;
