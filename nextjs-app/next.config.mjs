/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  server: {
    host: '0.0.0.0', // Ensure Next.js binds to all interfaces
  },
};

export default nextConfig;
