/**
 * Centralized API Configuration
 * Supports both local development and production deployments
 * 
 * Environment Variable: NEXT_PUBLIC_API_URL
 * Default Fallback: http://localhost:5000
 */

export const getApiBaseUrl = (): string => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
    "http://localhost:5000";
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
