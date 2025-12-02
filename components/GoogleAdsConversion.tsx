"use client"

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function GoogleAdsConversion() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Controlla se siamo nella pagina di successo checkout
    const checkoutSuccess = searchParams.get('checkout')
    const orderId = searchParams.get('orderId')

    if (checkoutSuccess === 'success' && orderId) {
      // Traccia conversione Google Ads
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-17774085187/4QsECMiQwcobEMOIrJtC',
          'value': 1.0,
          'currency': 'EUR',
          'transaction_id': orderId
        });
        
        console.log('Google Ads conversion tracked:', orderId)
      }
    }
  }, [searchParams])

  return null
}


