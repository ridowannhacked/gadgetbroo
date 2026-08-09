import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    authInterrupts: true,
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/imageKitLoader.ts",
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io" },
    ],
  },
};

export default nextConfig;
