import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import { AuthProvider } from '@/components/AuthContext'
import { ToastProvider } from '@/components/Toast'
import SEO from '@/components/SEO'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Onde di Cacao - Artigianato dalla Costiera Amalfitana',
    template: '%s | Onde di Cacao'
  },
  description: 'Cioccolatini artigianali di alta qualità dalla Costiera Amalfitana. Esperienza stellata, ingredienti premium.',
  keywords: ['cioccolatini artigianali', 'Costiera Amalfitana', 'cioccolato premium', 'dolci artigianali', 'Onde di Cacao'],
  authors: [{ name: 'Onde di Cacao' }],
  creator: 'Onde di Cacao',
  publisher: 'Onde di Cacao',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: 'Onde di Cacao - Artigianato dalla Costiera Amalfitana',
    title: 'Onde di Cacao - Artigianato dalla Costiera Amalfitana',
    description: 'Cioccolatini artigianali di alta qualità dalla Costiera Amalfitana. Esperienza stellata, ingredienti premium.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    images: [
      {
        url: '/images/ondedicacao.png',
        width: 1200,
        height: 630,
        alt: 'Onde di Cacao - Cioccolatini Artigianali'
      }
    ]
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onde di Cacao - Artigianato dalla Costiera Amalfitana',
    description: 'Cioccolatini artigianali di alta qualità dalla Costiera Amalfitana. Esperienza stellata, ingredienti premium.',
    images: ['/images/ondedicacao.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  verification: {
    google: 'XIq4acpxTlNtBAd8h-dGNQp0mAhwEh-yhRJ0lqspMyQ',
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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KD3392VW4T"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KD3392VW4T');
            gtag('config', 'AW-17774085187');
          `}
        </Script>
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
