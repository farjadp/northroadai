/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚡ ENABLE 'export' ONLY for Mobile Builds (Capacitor)
  // For Web/Dev (Cloud Run), we need standard server mode for API Routes.
  output: process.env.MOBILE_BUILD === 'true' ? 'export' : undefined,

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Always true for Capacitor, harmless for web
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
      },
    ],
  },
};

export default nextConfig;
