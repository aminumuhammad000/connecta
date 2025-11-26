"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToDrive = void 0;
const google_config_1 = require("../config/google.config");
const fs_1 = __importDefault(require("fs"));
const uploadFileToDrive = async (req, res) => {
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
            body: fs_1.default.createReadStream(req.file.path),
        };
        const response = await google_config_1.drive.files.create({
            requestBody: fileMetadata,
            media,
            fields: "id, webViewLink, webContentLink",
        });
        // Delete temp file after upload
        fs_1.default.unlinkSync(req.file.path);
        res.status(200).json({
            message: "File uploaded successfully",
            data: response.data,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to upload file", error: error.message });
    }
};
exports.uploadFileToDrive = uploadFileToDrive;
