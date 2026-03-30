import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Vercel cron jobs call /api/cron/check-links as a GET request.
  // Schedule is configured in vercel.json.
}

export default nextConfig
