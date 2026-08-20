import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WebM export uses MediaRecorder, so no cross-origin isolation headers are needed.
};

export default nextConfig;
