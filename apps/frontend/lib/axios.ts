// apps/frontend/lib/axios.ts
import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000";

const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: false,
});

export default api;
