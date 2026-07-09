/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/better-taro75',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
