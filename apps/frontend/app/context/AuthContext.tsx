"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/config";

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  avatar?: string; // ✅ user avatar URL
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>; // ✅ new function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

const readStoredAuth = (): { token: string; user: User } | null => {
  const candidates: Array<{ token: string | null; user: string | null; storage: Storage }> = [
    {
      token: sessionStorage.getItem("token"),
      user: sessionStorage.getItem("user"),
      storage: sessionStorage,
    },
    {
      token: localStorage.getItem("token"),
      user: localStorage.getItem("user"),
      storage: localStorage,
    },
  ];

  for (const candidate of candidates) {
    if (!candidate.token || !candidate.user) continue;

    if (isTokenExpired(candidate.token)) {
      candidate.storage.removeItem("token");
      candidate.storage.removeItem("user");
      continue;
    }

    try {
      return {
        token: candidate.token,
        user: JSON.parse(candidate.user) as User,
      };
    } catch {
      candidate.storage.removeItem("token");
      candidate.storage.removeItem("user");
    }
  }

  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ✅ Load user from localStorage/sessionStorage
  useEffect(() => {
    const storedAuth = readStoredAuth();

    if (storedAuth) {
      setToken(storedAuth.token);
      setUser(storedAuth.user);
    }
    setIsLoading(false);
  }, []);

  // ✅ New function to fetch latest user data (with avatar)
  const refreshUser = async () => {
    try {
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok && data.user) {
        setUser(data.user);
        if (sessionStorage.getItem("token") === token) {
          sessionStorage.setItem("user", JSON.stringify(data.user));
        } else {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
  };

  // ✅ Login function - now includes avatar persistence
  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        const rawMessage =
          data && typeof data.message === "string"
            ? data.message
            : data && data.error
            ? data.error
            : "Login failed";

        let errorMsg = rawMessage;

        if (rawMessage.includes("Too many failed attempts")) {
          errorMsg = "Too many failed attempts.\nTry again after 10 minutes.";
        } else if (
          data &&
          typeof data.remainingAttempts === "number" &&
          data.remainingAttempts >= 0
        ) {
          errorMsg = `Invalid email or password\nRemaining attempts: ${data.remainingAttempts}`;
        }

        toast.error(errorMsg);
        return;
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      // Keep a single source of truth so interceptors never pick stale tokens.
      otherStorage.removeItem("token");
      otherStorage.removeItem("user");
      storage.setItem("token", data.token);
      storage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      toast.success(`Welcome back, ${(data.user.name).toUpperCase()}! 🎉`);
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
      throw error;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created! Please verify your email.");
      router.push("/verify-otp");
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
      throw error;
    }
  };

  // ✅ Logout clears both storage types
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);

    toast.success("Logged out successfully!");
    router.push("/");
  };

  // ✅ Update user (including avatar)
const updateUser = (userData: Partial<User>) => {
  const API_URL = API_BASE_URL;

  let finalAvatar = userData.avatar ?? user?.avatar;

  // 🟦 If backend returns `/uploads/...` → convert to full URL
  if (finalAvatar && finalAvatar.startsWith("/uploads")) {
    finalAvatar = `${API_URL}${finalAvatar}`;
  }

  // 🟥 If avatar is a blob preview (frontend only), ignore it
  if (finalAvatar && finalAvatar.startsWith("blob:")) {
    finalAvatar = user?.avatar || undefined;
  }

  // Ensure required fields are present and not undefined
  if (!user || typeof user.id !== "number" || !user.name || !user.email) {
    // Do not update if base user is missing required fields
    return;
  }

  const updatedUser: User = {
    id: user.id,
    name: userData.name ?? user.name,
    email: userData.email ?? user.email,
    role: userData.role ?? user.role,
    avatar: finalAvatar,
  };

  setUser(updatedUser);

  if (sessionStorage.getItem("token") === token) {
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
  } else {
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }
};



  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser, // ✅ added
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
