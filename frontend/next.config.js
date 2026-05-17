/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Disables in dev, runs in production
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  allowedDevOrigins: ['3.144.165.94'],
  devIndicators: { appIsrStatus: false },
  turbopack: {}, // <-- THIS LINE FIXES THE CRASH
};

module.exports = withPWA(nextConfig);
