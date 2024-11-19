// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Your existing Next.js config options (if any)

  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack(config, options) {
    // Find the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.('.svg')
    );

    if (fileLoaderRule) {
      // Exclude SVG files from the existing file loader
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // Add a new rule to handle SVGs with @svgr/webpack
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;

