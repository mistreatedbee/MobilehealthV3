import { Capacitor } from "@capacitor/core";

/**
 * Get the API URL based on the platform and environment
 * - Web: Uses VITE_API_URL from .env or localhost:5000
 * - Android Emulator: Uses 10.0.2.2:5000 (maps to host localhost)
 * - Android Device: Uses VITE_API_URL from .env or production URL
 * - iOS: Uses VITE_API_URL from .env or localhost:5000
 */
export function getApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If environment variable is set, use it (works for all platforms)
  if (envUrl) {
    return envUrl;
  }

  // Fallback based on platform
  const platform = Capacitor.getPlatform();
  
  if (platform === "android") {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    // For real devices, you should set VITE_API_URL in .env to your production URL
    return "http://10.0.2.2:5000";
  }
  
  // Web and iOS default to localhost
  return "http://localhost:5000";
}

export const API_URL = getApiUrl();

