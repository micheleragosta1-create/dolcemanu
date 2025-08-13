import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

// Helper per leggere il raw body richiesto da Stripe
async function readRawBody(request: Request): Promise<string> {
  const text = await request.text()
  return text
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const stripeSecret = process.env.STRIPE_SECRET_KEY

    // In dev senza segreti, accetta silenziosamente
    if (!webhookSecret || !stripeSecret) {
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ received: true, mock: true })
      }
      return NextResponse.json({ error: 'Stripe webhook non configurato' }, { status: 500 })
    }

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' })

    const sig = request.headers.get('stripe-signature') as string
    const payload = await readRawBody(request)

    let event: any
    try {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret)
    } catch (err: any) {
      return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 })
    }

    // Gestione eventi principali
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const orderId = session?.metadata?.order_id
      const userEmail = session?.customer_details?.email || session?.metadata?.user_email

      // Se disponibile order_id, aggiorna stato a processing
      if (orderId) {
        try {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
          await supabase
            .from('orders')
            .update({ status: 'processing', updated_at: new Date().toISOString() })
            .eq('id', orderId)
        } catch (e) {
          console.error('Errore aggiornamento ordine da webhook:', e)
        }
      }

      // Log essenziale
      console.log('✅ Stripe checkout.session.completed', { orderId, userEmail, amount_total: session?.amount_total })
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('Errore webhook Stripe:', e)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}


