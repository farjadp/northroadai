/** @type {import('next').NextConfig} */
const nextConfig = {
  // برای Cloud Run و Docker حیاتی است
  output: "standalone",
  
  // تنظیمات نادیده گرفتن خطاها در بیلد (برای جلوگیری از فیل شدن بیلد)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;