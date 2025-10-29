import { Request, Response } from "express";
import { drive } from "../config/google.config";
import fs from "fs";

export const uploadFileToDrive = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileMetadata = {
      name: req.file.originalname,
      parents: ["YOUR_FOLDER_ID"], // Optional: specify folder in Drive
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, webViewLink, webContentLink",
    });

    // Delete temp file after upload
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "File uploaded successfully",
      data: response.data,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload file", error: error.message });
  }
};
