import type { NextConfig } from "next";

// Enable standalone output so we can copy a minimal server into the runtime image.
// Additional hardening/perf flags can be added here later.
const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
  },
};

export default nextConfig;
