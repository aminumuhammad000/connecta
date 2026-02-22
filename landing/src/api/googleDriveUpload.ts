// src/api/googleDriveUpload.ts
import { useEffect } from "react";

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY!;
const SCOPES = "https://www.googleapis.com/auth/drive.file";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

export function useGooglePicker(onFilePicked: (fileId: string, fileName: string, fileUrl: string) => void) {
  useEffect(() => {
    const initClient = () => {
      window.gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      });
    };

    window.gapi.load("client:auth2", initClient);
  }, []);

  const handleAuthClick = () => {
    window.gapi.auth2.getAuthInstance().signIn().then(() => {
      const token = window.gapi.auth.getToken().access_token;

      const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
      const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(token)
        .setDeveloperKey(API_KEY)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const doc = data.docs[0];
            onFilePicked(doc.id, doc.name, doc.url);
          }
        })
        .build();
      picker.setVisible(true);
    });
  };

  return { handleAuthClick };
}
