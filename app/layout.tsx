import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import { AuthProvider } from '@/components/AuthContext'

export const metadata: Metadata = {
  title: 'Cioccolatini Michele - Artigianato dalla Costiera Amalfitana',
  description: 'Cioccolatini artigianali di alta qualità dalla Costiera Amalfitana. Esperienza stellata, ingredienti premium.',
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
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
