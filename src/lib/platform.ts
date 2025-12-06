// ============================================================================
// 📁 Hardware Source: src/lib/platform.ts
// 🕒 Date: 2025-12-05
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic: Platform detection and API URL handling for Capacitor.
// ============================================================================

import { Capacitor } from '@capacitor/core';

export const isNativeApp = (): boolean => {
    return Capacitor.isNativePlatform();
};

const PROD_API_BASE = 'https://northroadai-851251000176.europe-west1.run.app';

export const getApiUrl = (path: string): string => {
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    if (isNativeApp()) {
        return `${PROD_API_BASE}${cleanPath}`;
    }
    return cleanPath;
};
