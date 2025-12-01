/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // عکس پروفایل گوگل
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // عکس‌های آپلود شده
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com', // اگر فیسبوک دارید
      },
    ],
  },
};

export default nextConfig;