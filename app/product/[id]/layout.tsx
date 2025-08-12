import type { Metadata } from 'next'
import { getProduct } from '@/lib/products'

type Props = {
  children: React.ReactNode
  params: { id: string }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const product = await getProduct(params.id)
  if (!product) {
    return {
      title: 'Prodotto non trovato',
      description: 'Il prodotto richiesto non è disponibile.'
    }
  }

  const title = `${product.name} | Cioccolatini Michele`
  const description = (product.description || '').slice(0, 160)
  const url = `${siteUrl}/product/${params.id}`
  const image = product.image_url?.startsWith('http') ? product.image_url : `${siteUrl}${product.image_url}`

  return {
    title,
    description,
    alternates: { canonical: `/product/${params.id}` },
    openGraph: {
      type: 'product',
      title,
      description,
      url,
      images: [{ url: image }]
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] }
  }
}

export default function ProductLayout({ children }: Props) {
  return children
}


