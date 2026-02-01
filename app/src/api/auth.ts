import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const API_URL = API_BASE_URL;

export const signup = (data: any) => axios.post(`${API_URL}/users/signup`, data);
export const login = (data: any) => axios.post(`${API_URL}/users/signin`, data);
export const googleAuth = (token: string) =>
  axios.post(`${API_URL}/users/google`, { token });
