/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  // Configure static file serving with longer timeout
  staticPageGenerationTimeout: 120,

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "verifiedsupplements.store",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.verifiedsupplements.store",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
