/**
 * Centralized API Configuration
 * Uses the deployed backend by default so production builds never
 * fall back to localhost.
 * 
 * Environment Variable: NEXT_PUBLIC_API_URL
 * Default Fallback: https://smartshop-api-xd4o.onrender.com
 */

const DEFAULT_API_URL = "https://smartshop-api-xd4o.onrender.com";

export const getApiBaseUrl = (): string => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
    DEFAULT_API_URL;
  return baseUrl;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Full API endpoint with /api prefix
 */
export const API_URL = `${API_BASE_URL}/api`;

/**
 * Helper function to construct full endpoint URLs
 * @param endpoint - The endpoint path (e.g., 'products', 'user/profile')
 * @returns Full URL to the endpoint
 */
export const getEndpoint = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_URL}/${cleanEndpoint}`;
};
