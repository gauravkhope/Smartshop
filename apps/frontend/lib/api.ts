// apps/frontend/lib/api.ts

import { API_URL } from "./config";

// Get token safely (client-side only)
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

// Build headers with auth token
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/* =======================
      PRODUCT APIs
======================= */

export async function fetchAllProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Failed to fetch products`);
    return res.json();
  } catch (err) {
    console.error("Error fetching products:", err);
    throw err;
  }
}

export async function fetchProductsByCategory(category: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/category/${category}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch products by category");
    return res.json();
  } catch (err) {
    console.error("Error fetching products by category:", err);
    throw err;
  }
}

export async function fetchProductsByBrand(brand: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/brand/${brand}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch products by brand");
    return res.json();
  } catch (err) {
    console.error("Error fetching products by brand:", err);
    throw err;
  }
}

export async function fetchProductById(id: string | number) {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
  } catch (err) {
    console.error("Error fetching product:", err);
    throw err;
  }
}

/* =======================
      USER PROFILE APIs
======================= */

export async function fetchUserProfile() {
  try {
    const res = await fetch(`${API_URL}/api/user/profile`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await safeJson(res);
      throw new Error(error?.message || "Failed to fetch profile");
    }

    return res.json();
  } catch (err) {
    console.error("Error fetching user profile:", err);
    throw err;
  }
}

export async function updateUserProfile(data: {
  name: string;
  email?: string;
  avatar?: File | string;
}) {
  try {
    const token = getAuthToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    let body: BodyInit;

    // If uploading file
    if (data.avatar instanceof File) {
      const fd = new FormData();
      fd.append("name", data.name);
      if (data.email) fd.append("email", data.email);
      fd.append("avatar", data.avatar);
      body = fd;
    } else {
      // JSON update
      body = JSON.stringify({
        name: data.name,
        email: data.email,
        avatar: typeof data.avatar === "string" ? data.avatar : undefined,
      });
      (headers as any)["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_URL}/api/user/profile`, {
      method: "PUT",
      headers,
      body,
    });

    if (!res.ok) {
      const error = await safeJson(res);
      throw new Error(error?.message || "Failed to update profile");
    }

    const updated = await res.json();

    // Update session/local storage user
    const store = localStorage.getItem("token") ? localStorage : sessionStorage;
    store.setItem("user", JSON.stringify(updated.user));

    return updated;
  } catch (err) {
    console.error("Error updating profile:", err);
    throw err;
  }
}

/* =======================
      LOGIN HISTORY
======================= */

export async function fetchLoginHistory() {
  try {
    const res = await fetch(`${API_URL}/api/user/login-history`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await safeJson(res);
      throw new Error(error?.message || "Failed to fetch login history");
    }

    return res.json();
  } catch (err) {
    console.error("Error fetching login history:", err);
    throw err;
  }
}

/* =======================
   PASSWORD RESET (Email)
======================= */

export async function requestPasswordReset(email: string) {
  try {
    const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const error = await safeJson(res);
      throw new Error(error?.message || "Failed to send reset email");
    }

    return res.json();
  } catch (err) {
    console.error("Error requesting password reset:", err);
    throw err;
  }
}

export async function resetPasswordWithToken(token: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (!res.ok) {
      const error = await safeJson(res);
      throw new Error(error?.message || "Failed to reset password");
    }

    return res.json();
  } catch (err) {
    console.error("Error resetting password:", err);
    throw err;
  }
}

/* =======================
   PASSWORD RESET (Code)
======================= */

export async function verifyResetCode(code: string, email: string) {
  try {
    const res = await fetch(`${API_URL}/api/auth/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, email }),
    });

    if (!res.ok) {
      const error = await safeJson(res);
      throw new Error(error?.message || "Invalid or expired code");
    }

    return res.json();
  } catch (err) {
    console.error("Error verifying code:", err);
    throw err;
  }
}

export async function resetPasswordWithCode(
  code: string,
  email: string,
  password: string
) {
  try {
    const res = await fetch(`${API_URL}/api/auth/reset-password-with-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, email, password }),
    });

    if (!res.ok) {
      const error = await safeJson(res);
      throw new Error(error?.message || "Failed to reset password");
    }

    return res.json();
  } catch (err) {
    console.error("Error resetting password with code:", err);
    throw err;
  }
}

/* =======================
     SAFE JSON PARSE
======================= */
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
