// apps/frontend/lib/axios.ts
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "./config";

let hasShownSessionExpiredToast = false;

const isTokenExpired = (jwtToken: string): boolean => {
  try {
    const parts = jwtToken.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload?.exp) return true;
    return Date.now() >= Number(payload.exp) * 1000;
  } catch {
    return true;
  }
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

// Debug interceptor – logs the full URL of every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const sessionToken = window.sessionStorage.getItem("token");
    const localToken = window.localStorage.getItem("token");
    const token = sessionToken || localToken;

    if (sessionToken && isTokenExpired(sessionToken)) {
      window.sessionStorage.removeItem("token");
      window.sessionStorage.removeItem("user");
    }

    if (localToken && isTokenExpired(localToken)) {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("user");
    }

    if (token && !isTokenExpired(token)) {
      config.headers = config.headers || {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  const fullUrl = (config.baseURL || "") + (config.url || "");
  console.log(`[axios] → ${config.method?.toUpperCase()} ${fullUrl}`);
  return config;
});

// Log 4xx/5xx responses so we can see the body in one place
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = Number(error.response.status || 0);
      const logMessage = `[axios] ← ${status} ${error.config?.url}`;

      if (status === 401 && typeof window !== "undefined") {
        window.sessionStorage.removeItem("token");
        window.sessionStorage.removeItem("user");
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("user");

        if (!hasShownSessionExpiredToast) {
          hasShownSessionExpiredToast = true;
          toast.error("Your LogIn Credentials Has Expired , Please LogIn Again To Continue...");
          window.setTimeout(() => {
            hasShownSessionExpiredToast = false;
          }, 1500);
        }

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      // 4xx are expected user-flow errors (validation/auth/rate-limit),
      // so avoid console.error to prevent noisy Next.js dev overlays.
      if (status >= 500) {
        console.error(logMessage, error.response.data);
      } else {
        console.warn(logMessage, error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
