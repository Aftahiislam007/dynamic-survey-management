/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  experimental: {
  },
}

module.exports = nextConfig