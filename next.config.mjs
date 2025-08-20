/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add static file serving configuration
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: '/images/:path*',
      },
    ];
  },
  // Ensure static files are served correctly
  experimental: {
    outputFileTracingRoot: undefined,
  },
  images: {
    unoptimized: true,
    domains: ['www.verifiedsupplements.store'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "verifiedsupplements.store",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.verifiedsupplements.store",
        port: "",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig;
