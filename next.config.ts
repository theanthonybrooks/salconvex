import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Allow module resolution from the root directory
    config.resolve.modules.push(path.resolve(__dirname))

    return config
  },
}

export default nextConfig
