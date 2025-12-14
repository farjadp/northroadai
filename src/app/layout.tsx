// ============================================================================
// 📁 Hardware Source: src/app/layout.tsx
// 🕒 Date: 2025-11-29 15:15
// 🧠 Version: v1.1 (Root Layout with Geist Fonts & Auth Context)
// ----------------------------------------------------------------------------
// ✅ What changed vs default Next.js layout:
// 1) Added standard header comments as requested.
// 2) Integrated <AuthProvider> for global Firebase session management.
// 3) Applied global Tailwind classes (bg-black, text-white) directly to body 
//    to fix the @apply issue.
// 4) Updated Metadata for "North Road AI".
//
// 📝 Notes:
// - We use Geist Sans/Mono as the new default fonts (Vercel's font).
// - The 'dark' class on <html> ensures Tailwind dark mode works properly.
// ============================================================================

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import Script from "next/script";

const getPublicRuntimeConfig = () => ({
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

const serializeRuntimeConfig = (
  config: ReturnType<typeof getPublicRuntimeConfig>
) => JSON.stringify(config).replace(/</g, "\\u003c");

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "North Road AI | Founder Copilot",
  description: "AI-powered mentorship & copilots for founders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtimeConfig = getPublicRuntimeConfig();
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-black text-white antialiased min-h-screen selection:bg-cyan-500/30 selection:text-cyan-100`}
      >
        <Script id="nra-runtime-config" strategy="beforeInteractive">
          {`window.__NRA_RUNTIME_CONFIG__ = ${serializeRuntimeConfig(runtimeConfig)};`}
        </Script>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
