import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@crewflow/shared', '@crewflow/engine', '@crewflow/ai'],
  serverExternalPackages: [
    '@prisma/client',
    '@anthropic-ai/sdk',
    'openai',
    'p-queue',
  ],
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
