import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Disable clientSegmentCache for Vercel compatibility
    // clientSegmentCache: true,
  },
  // Disable static optimization for problematic pages
  trailingSlash: false,
  // Memory optimization settings
  webpack: (config, { dev, isServer }) => {
    // Exclude canvas and jsdom from server-side rendering
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'canvas',
        jsdom: 'jsdom',
      });
    }
    
    return config;
  },
  // PWA configuration
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;