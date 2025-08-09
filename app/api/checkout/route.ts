import { NextResponse } from 'next/server'

// Assicura runtime Node.js (necessario per l'SDK Stripe)
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Fallback di test in dev: se manca la chiave Stripe, restituisco un redirect fittizio
    if (!process.env.STRIPE_SECRET_KEY) {
      if (process.env.NODE_ENV !== 'production') {
        const success = body?.success_url || 'http://localhost:3000/?checkout=success'
        return NextResponse.json({ url: `${success}&mock=stripe` })
      }
      return NextResponse.json({ error: 'Stripe non configurato' }, { status: 500 })
    }

    // Dynamically import Stripe only when needed
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

    const line_items = (body.items || []).map((i: any) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: i.name },
        unit_amount: i.unit_amount,
      },
      quantity: i.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: body.success_url || 'https://example.com',
      cancel_url: body.cancel_url || 'https://example.com',
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Checkout error' }, { status: 500 })
  }
}
