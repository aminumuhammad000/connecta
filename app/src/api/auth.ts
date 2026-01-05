import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const signup = (data: any) => axios.post(`${API_URL}/users/signup`, data);
export const login = (data: any) => axios.post(`${API_URL}/users/signin`, data);
export const googleAuth = (token: string) =>
  axios.post(`${API_URL}/users/google`, { token });
