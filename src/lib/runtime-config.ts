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

export const buildPublicRuntimeConfig = (): Required<PublicRuntimeConfig> => ({
  NEXT_PUBLIC_FIREBASE_API_KEY:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    "",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.FIREBASE_AUTH_DOMAIN ||
    "",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    "",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    "",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    "",
  NEXT_PUBLIC_FIREBASE_APP_ID:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    process.env.FIREBASE_APP_ID ||
    "",
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    process.env.FIREBASE_MEASUREMENT_ID ||
    "",
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "",
});

export const serializeRuntimeConfig = (
  config: PublicRuntimeConfig
) => JSON.stringify(config).replace(/</g, "\\u003c");

export type { PublicRuntimeConfig };
