/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { hostname: "avatar.vercel.sh" },
      { hostname: "api.dicebear.com" },
      { hostname: "2lbk6x9hemafqpif.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
