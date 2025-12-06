import { Capacitor } from '@capacitor/core';

// TODO: Replace [ID] with the actual Cloud Run Service ID
const PROD_API_BASE = 'https://northroadai.run.app';

export const getApiBaseUrl = () => {
    if (Capacitor.isNativePlatform()) {
        return PROD_API_BASE;
    }
    return ''; // Relative path for web
};

export const getApiUrl = (endpoint: string) => {
    const base = getApiBaseUrl();
    // Ensure we don't double slash if endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${cleanEndpoint}`;
};
