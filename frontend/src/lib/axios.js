import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://real-time-chatapp-1-vyz7.onrender.com",
  withCredentials: true,
});
