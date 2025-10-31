import axios from "axios";

const BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api";
const API_URL = `${BASE}/profiles`;

// Get the profile for the authenticated user
export const getProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token provided");
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err: any) {
    // If profile not found, create it and return the created profile
    if (err?.response?.status === 404) {
      const rawToken = token;
      let userIdFromToken: string | null = null;
      try {
        const payload = JSON.parse(atob(rawToken.split('.')[1]));
        userIdFromToken = payload?.id || payload?._id || null;
      } catch (_) {
        userIdFromToken = null;
      }
      const userId = userIdFromToken || localStorage.getItem("userId");
      if (!userId) throw err;

      // 1) Try to find existing profile via list first
      try {
        const list = await axios.get(`${API_URL}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const profiles: any[] = Array.isArray(list.data) ? list.data : [];
        const prof = profiles.find((p: any) => {
          const u = p?.user;
          if (!u) return false;
          if (typeof u === 'string') return u === userId;
          return u?._id === userId;
        });
        if (prof) return prof;
      } catch (_) {
        // ignore and try create
      }
      try {
        await axios.post(
          `${API_URL}`,
          { user: userId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (createErr: any) {
        // If profile already exists for that user, fall through to fetch list
        const alreadyExists = createErr?.response?.status === 400 &&
          /Profile already exists/i.test(createErr?.response?.data?.message || "");
        if (!alreadyExists) throw createErr;
      }

      // Try /me again first
      try {
        const created = await axios.get(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        return created.data;
      } catch (_) {
        // As a final fallback, fetch all profiles and match by local userId
        const list = await axios.get(`${API_URL}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const profiles: any[] = Array.isArray(list.data) ? list.data : [];
        const prof = profiles.find((p: any) => {
          const u = p?.user;
          if (!u) return false;
          if (typeof u === 'string') return u === userId;
          return u?._id === userId;
        });
        if (prof) return prof;
        throw err;
      }
    }
    throw err;
  }
};
