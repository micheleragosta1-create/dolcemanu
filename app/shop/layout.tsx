import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop | Cioccolatini Michele',
  description: 'Scopri cioccolatini artigianali: assortiti, tavolette, praline e altre specialità.',
  alternates: { canonical: '/shop' },
  openGraph: { type: 'website' },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}


