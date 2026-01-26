import { Request, Response } from "express";
import { drive } from "../config/google.config.js";
import fs from "fs";

export const uploadFileToDrive = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Construct public URL (assuming server serves 'uploads' statically)
    const fileUrl = `/uploads/${req.file.filename}`;

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
