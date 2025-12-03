"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToDrive = void 0;
const uploadFileToDrive = async (req, res) => {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to upload file", error: error.message });
    }
};
exports.uploadFileToDrive = uploadFileToDrive;
