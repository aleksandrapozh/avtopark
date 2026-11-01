import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Оставляем внешними только те пакеты, у которых нативный код
  // или динамический require внутри (mysql2 требует этого,
  // bcryptjs — из соображений производительности).
  serverExternalPackages: ["mysql2", "bcryptjs"],
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;