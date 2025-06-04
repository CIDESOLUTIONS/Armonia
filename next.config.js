// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuraciones básicas
  reactStrictMode: true,
  
  // Asegurar que Next.js maneje correctamente las rutas con grupos
  serverExternalPackages: ["@prisma/client"]
}

module.exports = nextConfig;