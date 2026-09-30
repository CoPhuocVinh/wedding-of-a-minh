import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    // Photos uploaded from /admin live on Google Drive.
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/d/**" }],
  },
};

export default nextConfig;
