import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@crewflow/shared', '@crewflow/engine', '@crewflow/ai'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
}

export default nextConfig
