import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@crewflow/shared', '@crewflow/engine', '@crewflow/ai'],
}

export default nextConfig
