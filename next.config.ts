import {withSentryConfig} from "@sentry/nextjs";
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

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "thestreetartlist",
project: "javascript-nextjs",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
// tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});

