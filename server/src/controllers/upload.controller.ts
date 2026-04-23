import { Request, Response } from "express";
import { drive } from "../config/google.config.js";
import fs from "fs";

export const uploadFileToDrive = async (req: Request, res: Response) => {
  console.log('📬 [Upload] Request received');
  console.log('📁 [Upload] req.file:', req.file ? `Yes (${req.file.originalname})` : 'No');
  console.log('📦 [Upload] req.body:', req.body);

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded", debug: { hasBody: !!req.body, bodyKeys: Object.keys(req.body || {}) } });
    }

    // Construct public URL
    // If using Cloudinary, req.file.path contains the URL.
    // Otherwise, we fallback to our local upload path.
    const fileUrl = (req.file as any).path || `/uploads/projects/${req.file.filename}`;

    res.status(200).json({
      message: "File uploaded successfully",
      data: {
        url: fileUrl,
        name: req.file.originalname,
        mimetype: req.file.mimetype
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload file", error: error.message });
  }
};
