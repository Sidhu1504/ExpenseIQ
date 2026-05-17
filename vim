/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  // Security is now handled by Nginx, so we allow all internal proxy traffic
  devIndicators: { appIsrStatus: false },
  turbopack: {},
};

module.exports = withPWA(nextConfig);
