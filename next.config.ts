import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/onboarding",
        destination: "https://docs.uwhpc.com/onboarding/",
        permanent: false,
      },
      {
        source: "/apply",
        destination: "https://docs.uwhpc.com/onboarding/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
