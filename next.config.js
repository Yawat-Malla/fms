/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  // Configure static file serving
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
  // Add static file serving from uploads directory
  experimental: {
    outputFileTracingIncludes: {
      '/api/uploads/**/*': ['uploads/**/*'],
    },
  },
  // Configure webpack for file handling
  webpack: (config) => {
    config.externals = [...config.externals, 'bcrypt'];
    config.module.rules.push({
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      type: 'asset/resource',
    });
    return config;
  },
  // Ensure public directory is properly served
  async headers() {
    return [
      {
        source: '/logos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Ensure static files are properly served
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  // Add public directory configuration
  publicRuntimeConfig: {
    uploadsPath: '/uploads',
  },
};

module.exports = nextConfig; 