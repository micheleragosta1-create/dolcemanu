/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com', 
      'via.placeholder.com',
      'ukvmltjmjhwoazabhicy.supabase.co' // Supabase Storage
    ],
  },
  eslint: {
    // Salta ESLint durante la build per velocizzare
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Non bloccare/controllare la build sui tipi (più veloce)
    ignoreBuildErrors: true,
  },
  // SWC minify esplicito (già default, ma lo rendiamo chiaro)
  swcMinify: true,
  // Evita source maps in prod (riduce tempi e output)
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
