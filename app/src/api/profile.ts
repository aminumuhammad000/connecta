import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/profiles";

// Get the profile for the authenticated user
export const getProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token provided");
  const response = await axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
