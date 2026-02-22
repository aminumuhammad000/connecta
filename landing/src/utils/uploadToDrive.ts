import { google } from "googleapis";
import fs from "fs";
import path from "path";

const KEYFILEPATH = path.join(__dirname, "../config/googleServiceAccount.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

export async function uploadFileToDrive(
  filePath: string,
  fileName: string,
  mimeType: string,
  folderId?: string
) {
  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : undefined, // optional parent folder
  };

  const media = {
    mimeType,
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, name, mimeType, webViewLink, webContentLink",
  });

  return response.data;
}
