import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    clientSegmentCache: true,
  },
  // Memory optimization settings
  webpack: (config, { dev, isServer }) => {
    // Increase memory limit for webpack
    config.infrastructureLogging = {
      level: 'error',
    };
    
    // Exclude canvas and jsdom from server-side rendering
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'canvas',
        jsdom: 'jsdom',
      });
    }
    
    // Optimize bundle size and lazy loading
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: -10,
          },
          // Separate chunk for heavy AI libraries
          tensorflow: {
            test: /[\\/]node_modules[\\/]@tensorflow[\\/]/,
            name: 'tensorflow',
            chunks: 'async',
            priority: 20,
            enforce: true,
          },
          // Separate chunk for image processing libraries
          imageProcessing: {
            test: /[\\/]node_modules[\\/](fabric|@imgly|piexifjs|jspdf|jszip)[\\/]/,
            name: 'image-processing',
            chunks: 'async',
            priority: 15,
            enforce: true,
          },
          // Separate chunk for React
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 30,
          },
        },
      };
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