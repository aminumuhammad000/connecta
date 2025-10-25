import axios from "axios";

const API_URL = "http://localhost:5000/api/users"; // change if needed

export const signup = (data: any) => axios.post(`${API_URL}/signup`, data);
export const login = (data: any) => axios.post(`${API_URL}/signin`, data);
export const googleAuth = (token: string) =>
  axios.post(`${API_URL}/google`, { token });
