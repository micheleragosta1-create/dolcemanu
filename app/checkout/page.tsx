"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useCart } from "@/components/CartContext"
import { loadStripe } from "@stripe/stripe-js"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

const stripePromise = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

export default function CheckoutPage() {
  const { items, totalAmount } = useCart()

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

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''

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
                <button className="btn btn-primary" onClick={handleStripeCheckout}>
                  Paga con Carta (Stripe)
                </button>

                <div style={{ margin: '1rem 0', color: '#666', textAlign: 'center' }}>oppure</div>

                {paypalClientId ? (
                  <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'EUR' }}>
                    <PayPalButtons
                      style={{ layout: "vertical" }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          intent: 'CAPTURE',
                          purchase_units: [
                            {
                              amount: {
                                currency_code: 'EUR',
                                value: totalAmount.toFixed(2)
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
                    />
                  </PayPalScriptProvider>
                ) : (
                  <div className="note">
                    Aggiungi NEXT_PUBLIC_PAYPAL_CLIENT_ID per abilitare PayPal
                  </div>
                )}
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
        @media (max-width: 992px) { .checkout-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  )
}
