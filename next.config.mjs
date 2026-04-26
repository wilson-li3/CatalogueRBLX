/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tr.rbxcdn.com" },
    ],
  },
};

export default nextConfig;
