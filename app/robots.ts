import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Se siamo sul dominio vercel.app, blocca completamente l'indicizzazione
  // per evitare che Google indicizzi il sito di staging
  if (siteUrl.includes('vercel.app')) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }
  
  // Altrimenti, permetti l'indicizzazione normale (solo sul dominio principale)
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/cart', '/checkout']
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  }
}


