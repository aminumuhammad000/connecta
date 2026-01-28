import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KEYFILEPATH = path.join(__dirname, "../serviceAccount.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
export const drive = google.drive({
    version: "v3",
    auth: new google.auth.GoogleAuth({
        keyFile: KEYFILEPATH,
        scopes: SCOPES,
    }),
});
