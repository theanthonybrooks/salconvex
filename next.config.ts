import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  typescript: {
    // ignoreBuildErrors: false, // Ensures TypeScript errors block builds
  },
  webpack: (config) => {
    // Allow module resolution from the root directory
    config.resolve.modules.push(path.resolve(__dirname))

    // Ensure TypeScript files in convex-helpers are compiled
    config.module.rules.push({
      test: /\.ts$/,
      include: /node_modules\/convex-helpers/,
      use: [{ loader: "ts-loader" }],
    })

    return config
  },
  images: {
    unoptimized: true, // 🚀 Completely disables Next.js image optimization
  },
}

export default nextConfig
