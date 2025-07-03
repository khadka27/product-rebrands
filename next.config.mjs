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
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "verifiedsupplements.store",
        port: "",
        pathname: "/**",
      },
    ],
    domains: ["source.unsplash.com", "images.unsplash.com", "verifiedsupplements.store", "www.verifiedsupplements.store"],
  },
}

export default nextConfig;
