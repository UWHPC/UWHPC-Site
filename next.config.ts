import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/onboarding",
        destination: "/join",
        permanent: false,
      },
      {
        source: "/apply",
        destination: "/join",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
