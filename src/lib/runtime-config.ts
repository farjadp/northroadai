type PublicRuntimeConfig = {
  NEXT_PUBLIC_FIREBASE_API_KEY?: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID?: string;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
  NEXT_PUBLIC_FIREBASE_APP_ID?: string;
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
  NEXT_PUBLIC_API_URL?: string;
};

declare global {
  interface Window {
    __NRA_RUNTIME_CONFIG__?: PublicRuntimeConfig;
  }
}

const isBrowser = typeof window !== "undefined";

export const getRuntimeConfigValue = (
  key: keyof PublicRuntimeConfig
): string | undefined => {
  if (isBrowser) {
    return window.__NRA_RUNTIME_CONFIG__?.[key];
  }

  const fallbackKey = key.startsWith("NEXT_PUBLIC_")
    ? key.replace("NEXT_PUBLIC_", "")
    : key;

  return process.env[key] || process.env[fallbackKey];
};

export type { PublicRuntimeConfig };
