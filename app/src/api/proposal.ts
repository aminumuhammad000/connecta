// Fetch all proposals for the current user
export const getProposals = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token provided");
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const API_URL = API_BASE_URL + "/proposals";

export const applyToJob = async ({ jobId, coverLetter, budget, duration, level, priceType, title }: {
  jobId: string;
  coverLetter: string;
  budget: number;
  duration: { startDate: string; endDate: string };
  level: string;
  priceType: string;
  title: string;
}) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token provided");
  const response = await axios.post(
    API_URL,
    {
      jobId,
      title,
      description: coverLetter,
      budget: { amount: budget, currency: "₦" },
      dateRange: duration,
      level,
      priceType,
      type: "recommendation", // default type
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
