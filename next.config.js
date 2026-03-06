/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack for faster builds
  turbopack: {},
  
  // Configure module path aliases for modular structure
  webpack: (config, { isServer }) => {
    return config;
  },
  
  // Optimize images
  images: {
    unoptimized: true,
  },
  
  // Enable React strict mode for development
  reactStrictMode: true,
  
  // Configure environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  },
};

module.exports = nextConfig;
