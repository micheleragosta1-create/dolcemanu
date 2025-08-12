import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import { AuthProvider } from '@/components/AuthContext'
import { ToastProvider } from '@/components/Toast'
import SEO from '@/components/SEO'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Cioccolatini Michele - Artigianato dalla Costiera Amalfitana',
    template: '%s | Cioccolatini Michele'
  },
  description: 'Cioccolatini artigianali di alta qualità dalla Costiera Amalfitana. Esperienza stellata, ingredienti premium.',
  openGraph: {
    type: 'website',
    title: 'Cioccolatini Michele',
    description: 'Cioccolatini artigianali premium dalla Costiera Amalfitana',
    url: '/',
    images: ['/images/ondedicacao.png']
  },
  alternates: {
    canonical: '/'
  },
  twitter: {
    card: 'summary_large_image'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <SEO />
              {children}
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
