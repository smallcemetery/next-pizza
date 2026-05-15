/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.dodostatic.net', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.dodostatic.net', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.inappstory.ru', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
