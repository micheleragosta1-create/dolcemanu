"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useCart } from "@/components/CartContext"
import { loadStripe } from "@stripe/stripe-js"
import { PayPalScriptProvider, PayPalButtons, FUNDING } from "@paypal/react-paypal-js"
import { useEffect, useState } from "react"

const stripePromise = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

export default function CheckoutPage() {
  const { items, totalAmount } = useCart()
  const [paypalReady, setPaypalReady] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const payableAmount = Number.isFinite(totalAmount) && totalAmount > 0 ? totalAmount : 1

  const handleStripeCheckout = async () => {
    if (!stripePromise) {
      alert("Stripe non è configurato. Aggiungi NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.")
      return
    }
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            name: i.nome,
            unit_amount: Math.round(i.prezzo * 100),
            quantity: i.qty
          })),
          success_url: `${window.location.origin}/?checkout=success`,
          cancel_url: `${window.location.origin}/cart`
        })
      })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        alert('Errore durante il checkout Stripe')
      }
    } catch (e) {
      console.error(e)
      alert('Errore di rete durante il checkout Stripe')
    }
  }

  // Forza sandbox finché richiesto
  const paypalClientId = 'sb'

  return (
    <main>
      <Header />
      <section className="checkout-section">
        <div className="checkout-container">
          <h1 className="poppins">Checkout</h1>
          {items.length === 0 ? (
            <p>Il carrello è vuoto.</p>
          ) : (
            <div className="checkout-grid">
              <div className="summary">
                <h2 className="poppins">Riepilogo ordine</h2>
                <ul className="list">
                  {items.map(i => (
                    <li key={i.id} className="row">
                      <span>{i.nome} × {i.qty}</span>
                      <strong>€ {(i.prezzo * i.qty).toFixed(2)}</strong>
                    </li>
                  ))}
                </ul>
                <div className="row total">
                  <span>Totale</span>
                  <strong>€ {totalAmount.toFixed(2)}</strong>
                </div>
              </div>

              <div className="payments">
                <h2 className="poppins">Pagamento</h2>
                <button className="stripe-btn" onClick={handleStripeCheckout}>
                  <svg className="stripe-icon" viewBox="0 0 60 25" width="60" height="25">
                    <path fill="#635bff" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17L15.8 6.6v3.47h3.12v3.5h-3.12v.47zM6.16 20.3C1.65 20.3 0 16.5 0 12.26 0 8.27 1.67 4.3 6.16 4.3c4.48 0 6.16 3.97 6.16 7.96 0 4.24-1.68 8.04-6.16 8.04zM6.16 7.73c-1.77 0-2.07 2.5-2.07 4.54 0 2.04.3 4.51 2.07 4.51 1.77 0 2.07-2.47 2.07-4.51 0-2.04-.3-4.54-2.07-4.54z"/>
                  </svg>
                  Paga con Carta di Credito
                </button>

                <div className="divider">
                  <span>oppure</span>
                </div>

                <div className="paypal-container">
                  {mounted && (
                  <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'EUR', intent: 'CAPTURE', components: 'buttons' }}>
                    <PayPalButtons
                        fundingSource={FUNDING.PAYPAL}
                        style={{ 
                          layout: "vertical", 
                          color: "gold", 
                          shape: "rect", 
                          label: "paypal", 
                          tagline: false,
                          height: 50
                        }}
                        forceReRender={[paypalClientId, 'EUR', payableAmount]}
                        onInit={() => setPaypalReady(true)}
                        createOrder={(data, actions) => {
                        return actions.order.create({
                          intent: 'CAPTURE',
                          purchase_units: [
                            {
                              amount: {
                                currency_code: 'EUR',
                                value: payableAmount.toFixed(2)
                              }
                            }
                          ]
                        })
                      }}
                      onApprove={async (data, actions) => {
                        await actions.order?.capture()
                        alert('Pagamento PayPal completato!')
                        window.location.href = '/?checkout=success'
                      }}
                      onError={(err) => {
                        console.error('PayPal error', err)
                        alert('PayPal non disponibile al momento. Riprova o usa la carta.')
                      }}
                      />
                  </PayPalScriptProvider>
                  )}
                  {!paypalReady && (
                    <div className="paypal-skeleton">
                      <div className="paypal-skeleton-bar" />
                    </div>
                  )}
                  <div className="note" style={{marginTop: 8, textAlign: 'center'}}>
                    {paypalClientId === 'sb' ? 'Modalità sandbox PayPal attiva (configura NEXT_PUBLIC_PAYPAL_CLIENT_ID per la modalità live).' : ''}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />

      <style jsx global>{`
        .checkout-section { position: relative; z-index: 10; padding: 7rem 2rem 3rem; }
        .checkout-container { max-width: 1000px; margin: 0 auto; }
        .checkout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .summary, .payments { background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 12px; padding: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,.06); }
        .list { list-style: none; padding: 0; margin: 0; display: grid; gap: .35rem; }
        .row { display: flex; justify-content: space-between; }
        .total { border-top: 1px solid #eee; padding-top: .5rem; margin-top: .5rem; }
        .note { text-align: center; color: #888; font-size: .9rem; }
        
        /* Stripe Button */
        .stripe-btn {
          width: 100%;
          background: linear-gradient(135deg, #635bff 0%, #5147e8 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 4px 15px rgba(99, 91, 255, 0.3);
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        
        .stripe-btn:hover {
          background: linear-gradient(135deg, #5147e8 0%, #4338ca 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 91, 255, 0.4);
        }

        /* Effetto rimosso */
        
        .stripe-icon {
          filter: brightness(0) invert(1);
        }
        
        /* Divider */
        .divider {
          position: relative;
          text-align: center;
          margin: 20px 0;
          color: #666;
          font-size: 14px;
        }
        
        .divider:before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e5e5;
          z-index: 0;
        }
        
        .divider span {
          background: white;
          padding: 0 15px;
          position: relative;
          z-index: 1;
        }
        
        /* PayPal Container */
        .paypal-container {
          margin-top: 10px;
          min-height: 60px;
        }
        .paypal-skeleton { width: 100%; height: 50px; border-radius: 12px; background: #f1f5f9; position: relative; overflow: hidden; }
        .paypal-skeleton-bar { position: absolute; inset: 0; background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%); animation: shimmer 1.2s infinite; }
        @keyframes shimmer { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%);} }
        
        @media (max-width: 992px) { .checkout-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  )
}
