/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Usa remotePatterns invece di domains per supportare tutti i progetti Supabase
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Wildcard per tutti i progetti Supabase
        pathname: '/storage/v1/object/public/**',
      },
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
