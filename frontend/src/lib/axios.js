import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE.VITE_API_URL,
  withCredentials: true,
});