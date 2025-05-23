// next.config.ts
/*
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Your existing Next.js config options (if any)

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
*/


// next.config.ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/home/:path*',
          destination: '/api/edge-proxy/:path*',
        },
        {
          source: '/home',
          destination: '/api/edge-proxy',
        }
      ],
      afterFiles: [], // Required empty array
      fallback: []    // Required empty array
    }
  },
  webpack(config, options) {
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.('.svg')
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;
