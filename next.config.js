/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds on Netlify to avoid blocking deploys on stylistic issues
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
