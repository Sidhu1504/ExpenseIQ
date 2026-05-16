/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['3.144.165.94'],
  devIndicators: {
    appIsrStatus: false, // Hides the bottom-right corner status badge completely
  },
};

module.exports = nextConfig;
