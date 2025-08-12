import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const routes: MetadataRoute.Sitemap = [
    '', '/shop', '/policy', '/auth'
  ].map((p) => ({ url: `${siteUrl}${p}`, lastModified: new Date() }))

  try {
    const products = await getProducts()
    const productUrls = products.map(p => ({
      url: `${siteUrl}/product/${p.id}`,
      lastModified: new Date(p.updated_at || p.created_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }))
    return [...routes, ...productUrls]
  } catch {
    return routes
  }
}


