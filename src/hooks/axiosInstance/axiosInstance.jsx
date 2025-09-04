import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://schoolmanagement-server-t10r.onrender.com/api", // Backend URL
  withCredentials: true, // Required for sending cookies
  headers: { "Content-Type": "application/json" },
});

export default axiosInstance;