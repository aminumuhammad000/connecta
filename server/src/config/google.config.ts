import { google } from "googleapis";
import path from "path";

const KEYFILEPATH = path.join(__dirname, "../serviceAccount.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

export const drive = google.drive({
  version: "v3",
  auth: new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  }),
});
