import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api", // Backend URL
  // https://schoolmanagement-server-t10r.onrender.com/api
  withCredentials: true, // Required for sending cookies
  headers: { "Content-Type": "application/json" },
});

export const baseImageURL = "http://localhost:3000";

export default axiosInstance;