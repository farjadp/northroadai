import { Capacitor } from '@capacitor/core';
import { getRuntimeConfigValue } from '@/lib/runtime-config';

// Automatically detects API base URL from environment or defaults to relative path
const resolveApiBase = () =>
    getRuntimeConfigValue('NEXT_PUBLIC_API_URL') || '';

export const getApiBaseUrl = () => {
    const baseUrl = resolveApiBase();
    if (Capacitor.isNativePlatform()) {
        // For native apps, we must have a full URL
        if (!baseUrl) {
            console.warn("⚠️ Native app detected but NEXT_PUBLIC_API_URL is missing.");
        }
        return baseUrl;
    }
    // For web, use relative path if API is on same domain, or env var if external
    return baseUrl;
};

export const getApiUrl = (endpoint: string) => {
    const base = getApiBaseUrl();
    // Ensure we don't double slash if endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${cleanEndpoint}`;
};
