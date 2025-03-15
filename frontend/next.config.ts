/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Проверка потенциальных ошибок в dev-режиме
  eslint: {
    ignoreDuringBuilds: true, // Игнорирует ошибки ESLint при сборке
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"], // Позволяет использовать SVG как React-компоненты
    });
    return config;
  },
  typescript: {
    ignoreBuildErrors: true, // Игнорирует ошибки TypeScript при сборке
  },
};

module.exports = nextConfig; // Экспорт для Next.js
