"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useCart } from "@/components/CartContext"
import { loadStripe } from "@stripe/stripe-js"
import { PayPalScriptProvider, PayPalButtons, FUNDING } from "@paypal/react-paypal-js"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/AuthContext"
import { getOwnProfile } from "@/lib/supabase"

const stripePromise = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

export default function CheckoutPage() {
  const { items, totalAmount } = useCart()
  const { user } = useAuth()
  const [paypalReady, setPaypalReady] = useState(false)
  const [paypalError, setPaypalError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [useProfileAddress, setUseProfileAddress] = useState(true)
  const [addr, setAddr] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [country, setCountry] = useState('Italia')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderInfo, setOrderInfo] = useState<{ orderId: string; payerName: string } | null>(null)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    ;(async () => {
      try {
        if (!user?.id) return
        const { data } = await getOwnProfile(user.id)
        if (data) {
          setAddr(data.address || '')
          setCity(data.city || '')
          setZip(data.zip || '')
          setCountry('Italia')
        }
      } catch {}
    })()
  }, [user?.id])
  useEffect(() => {
    if (!mounted) return
    const timer = window.setTimeout(() => {
      if (!paypalReady) {
        setPaypalError('PayPal non si è caricato. Verifica la connessione o ricarica la pagina.')
      }
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [mounted, paypalReady])
  const payableAmount = Number.isFinite(totalAmount) && totalAmount > 0 ? totalAmount : 1

  const handleStripeCheckout = async () => {
    try {
      // 1) Crea l'ordine lato server per ottenere order_id (metadati Stripe)
      let orderId: string | null = null
      try {
        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_email: user?.email || 'guest@local.test',
            items: items.map(i => ({ product_id: String(i.id), quantity: i.qty })),
            shipping_address: addr,
            shipping_city: city,
            shipping_postal_code: zip,
            shipping_country: country
          })
        })
        const orderData = await orderRes.json()
        if (orderRes.ok && orderData?.order_id) {
          orderId = orderData.order_id
        }
      } catch (e) {
        // Se fallisce, proseguiamo senza metadata
        console.warn('Creazione ordine preliminare fallita, proseguo senza metadata', e)
      }

      // 2) Crea la sessione Stripe passando anche i metadata se disponibili
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
          cancel_url: `${window.location.origin}/cart`,
          order_id: orderId || '',
          user_email: user?.email || ''
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

  // Preferisce env, fallback sandbox
  // Fallback sandbox ufficiale di PayPal e trim per evitare spazi invisibili
  const paypalClientId = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb').trim()

  // Evita mismatch SSR/CSR: mostra placeholder fino al mount
  if (!mounted) {
    return (
      <main>
        <Header />
        <section className="checkout-section">
          <div className="checkout-container">
            <h1 className="poppins">Checkout</h1>
            <div className="summary" style={{marginTop: '1rem'}}>
              <p>Caricamento checkout...</p>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Header />
      
      {/* Modal di successo ordine */}
      {showSuccessModal && orderInfo && (
        <div className="success-modal-overlay" onClick={() => {
          setShowSuccessModal(false)
          window.location.href = `/?checkout=success&orderId=${orderInfo.orderId}`
        }}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">✓</div>
            <h2 className="poppins">Grazie {orderInfo.payerName}!</h2>
            <p className="success-message">
              Il tuo ordine è stato ricevuto con successo
            </p>
            <div className="order-number">
              <span className="label">Numero Ordine:</span>
              <span className="value">#{orderInfo.orderId.substring(0, 8).toUpperCase()}</span>
            </div>
            <div className="success-details">
              <p>📧 Riceverai una email di conferma a breve</p>
              <p>📦 Potrai tracciare il tuo ordine nella sezione "I miei ordini"</p>
            </div>
            <button 
              className="success-btn"
              onClick={() => {
                setShowSuccessModal(false)
                window.location.href = `/?checkout=success&orderId=${orderInfo.orderId}`
              }}
            >
              Continua gli Acquisti
            </button>
          </div>
        </div>
      )}
      
      <section className="checkout-section">
        <div className="checkout-container">
          <h1 className="poppins">Checkout</h1>
          
          {/* Controllo autenticazione */}
          {!user ? (
            <div className="auth-required">
              <div className="auth-icon">🔒</div>
              <h2 className="poppins">Accesso richiesto</h2>
              <p>Per completare l'ordine è necessario effettuare l'accesso o creare un account.</p>
              <div className="auth-benefits">
                <h3>Perché registrarsi?</h3>
                <ul>
                  <li>✓ Salva i tuoi indirizzi di spedizione</li>
                  <li>✓ Monitora lo stato degli ordini</li>
                  <li>✓ Checkout più veloce</li>
                  <li>✓ Storico degli acquisti</li>
                </ul>
              </div>
              <div className="auth-actions">
                <a href="/auth" className="btn btn-primary">
                  Accedi o Registrati
                </a>
                <a href="/cart" className="btn btn-secondary">
                  Torna al Carrello
                </a>
              </div>
            </div>
          ) : items.length === 0 ? (
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
                <div className="shipping">
                  <div className="ship-row" style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                    <input id="use-prof" type="checkbox" checked={useProfileAddress} onChange={e=>setUseProfileAddress(e.target.checked)} />
                    <label htmlFor="use-prof">Usa indirizzo di registrazione</label>
                  </div>
                  <div className="ship-grid">
                    <div className="ship-field">
                      <label className="ship-label" htmlFor="ship-addr">Indirizzo</label>
                      <input id="ship-addr" type="text" value={addr} onChange={e=>setAddr(e.target.value)} disabled={useProfileAddress} placeholder="Via/Piazza e numero" />
                    </div>
                    <div className="ship-field">
                      <label className="ship-label" htmlFor="ship-city">Città</label>
                      <input id="ship-city" type="text" value={city} onChange={e=>setCity(e.target.value)} disabled={useProfileAddress} placeholder="Es. Salerno" />
                    </div>
                  </div>
                  <div className="ship-grid">
                    <div className="ship-field">
                      <label className="ship-label" htmlFor="ship-zip">CAP</label>
                      <input id="ship-zip" type="text" value={zip} onChange={e=>setZip(e.target.value)} disabled={useProfileAddress} placeholder="Es. 84100" />
                    </div>
                    <div className="ship-field">
                      <label className="ship-label" htmlFor="ship-country">Paese</label>
                      <input id="ship-country" type="text" value={country} onChange={e=>setCountry(e.target.value)} disabled={useProfileAddress} placeholder="Italia" />
                    </div>
                  </div>
                </div>
                <button className="stripe-btn" onClick={handleStripeCheckout} aria-label="Paga con Stripe">
                  <svg className="stripe-icon" viewBox="0 0 60 25" width="44" height="18" aria-hidden="true">
                    <path fill="#635bff" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17L15.8 6.6v3.47h3.12v3.5h-3.12v.47zM6.16 20.3C1.65 20.3 0 16.5 0 12.26 0 8.27 1.67 4.3 6.16 4.3c4.48 0 6.16 3.97 6.16 7.96 0 4.24-1.68 8.04-6.16 8.04zM6.16 7.73c-1.77 0-2.07 2.5-2.07 4.54 0 2.04.3 4.51 2.07 4.51 1.77 0 2.07-2.47 2.07-4.51 0-2.04-.3-4.54-2.07-4.54z"/>
                  </svg>
                  Paga con Carta di Credito
                </button>

                <div className="divider">
                  <span>oppure</span>
                </div>

                <div className="paypal-container">
                  {mounted && paypalClientId && (
                  <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'EUR', intent: 'capture', components: 'buttons', locale: 'it_IT', debug: true }}>
                     <PayPalButtons
                        // Lasciamo che la SDK scelga il funding idoneo
                        style={{ 
                          layout: "vertical", 
                          color: "gold", // Gold ufficiale per alta visibilità
                          shape: "rect", 
                          label: "paypal", 
                          tagline: false,
                          height: 50
                        }}
                        forceReRender={[paypalClientId, 'EUR', payableAmount, items.length]}
                        onInit={() => setPaypalReady(true)}
                        onClick={(_, actions) => {
                          if (!items.length || payableAmount <= 0) return actions.reject()
                          return actions.resolve()
                        }}
                        createOrder={(data, actions) => {
                        const paypalItems = items.map(i => ({
                          name: i.nome,
                          quantity: String(i.qty),
                          unit_amount: { currency_code: 'EUR', value: i.prezzo.toFixed(2) }
                        }))
                        const total = items.reduce((sum, i) => sum + i.prezzo * i.qty, 0)
                        return actions.order.create({
                          intent: 'CAPTURE',
                          purchase_units: [
                            {
                              description: 'Acquisto dolci artigianali',
                              items: paypalItems,
                              amount: {
                                currency_code: 'EUR',
                                value: total.toFixed(2),
                                breakdown: {
                                  item_total: { currency_code: 'EUR', value: total.toFixed(2) }
                                }
                              }
                            }
                          ],
                          application_context: {
                            shipping_preference: 'NO_SHIPPING',
                          }
                        })
                      }}
                      onApprove={async (data, actions) => {
                        try {
                          // Cattura il pagamento
                          const details = await actions.order?.capture()
                          const payerName = details?.payer?.name?.given_name || 'Cliente'
                          
                          // Salva l'ordine nel database
                          const saveResponse = await fetch('/api/paypal-capture', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              paypalOrderId: data.orderID,
                              orderDetails: {
                                items: items.map(i => ({
                                  productId: i.id,
                                  quantity: i.qty,
                                  price: i.prezzo
                                }))
                              },
                              userId: user?.id,  // ✅ IMPORTANTE: ID univoco utente
                              userEmail: user?.email || 'guest@local.test',
                              shippingAddress: {
                                address: addr,
                                city: city,
                                zip: zip,
                                country: country,
                                notes: ''
                              }
                            })
                          })

                          const saveResult = await saveResponse.json()
                          
                          if (saveResponse.ok && saveResult.success) {
                            // Mostra popup di successo
                            setOrderInfo({ orderId: saveResult.orderId, payerName })
                            setShowSuccessModal(true)
                          } else {
                            console.error('Errore salvataggio ordine:', saveResult.error)
                            alert(`Pagamento completato ma errore nel salvataggio: ${saveResult.error}`)
                          }
                        } catch (err) {
                          console.error('Errore durante onApprove:', err)
                          alert('Pagamento completato ma errore nel processare l\'ordine. Contatta il supporto.')
                        }
                      }}
                      onError={(err) => {
                        console.error('PayPal error', err)
                        setPaypalError('PayPal non disponibile al momento. Riprova o usa la carta.')
                      }}
                      />
                  </PayPalScriptProvider>
                  )}
                   <div className="note" style={{marginTop: 8, textAlign: 'center'}}>
                    {paypalError
                      ? paypalError
                      : (!paypalReady
                          ? 'Caricamento PayPal…'
                          : (paypalClientId === 'sb' ? 'Modalità sandbox PayPal attiva (configura NEXT_PUBLIC_PAYPAL_CLIENT_ID per la modalità live).' : ''))}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />

      <style jsx global>{`
        .checkout-section { position: relative; z-index: 10; padding: 13rem 2rem 3rem; }
        .checkout-container { max-width: 1000px; width: min(1000px, 100%); margin-inline: auto; }
        
        /* Auth Required Box */
        .auth-required {
          background: white;
          border-radius: 16px;
          padding: 3rem 2rem;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          max-width: 600px;
          margin: 2rem auto;
        }
        
        .auth-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .auth-required h2 {
          font-size: 1.8rem;
          color: var(--color-navy);
          margin-bottom: 0.75rem;
        }
        
        .auth-required > p {
          color: #666;
          font-size: 1.1rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .auth-benefits {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }
        
        .auth-benefits h3 {
          font-size: 1.1rem;
          color: var(--color-navy);
          margin-bottom: 1rem;
          font-weight: 600;
        }
        
        .auth-benefits ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 0.75rem;
        }
        
        .auth-benefits li {
          color: #555;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .auth-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .auth-actions .btn {
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 12px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .auth-actions .btn-primary {
          background: var(--color-brown);
          color: white;
          border: none;
        }
        
        .auth-actions .btn-primary:hover {
          background: #6d3d0f;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(94, 54, 33, 0.3);
        }
        
        .auth-actions .btn-secondary {
          background: white;
          color: var(--color-brown);
          border: 2px solid var(--color-brown);
        }
        
        .auth-actions .btn-secondary:hover {
          background: var(--color-brown);
          color: white;
          transform: translateY(-2px);
        }
        
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

        .stripe-icon { 
          filter: brightness(0) invert(1); 
          width: 44px; 
          height: 18px; 
          flex-shrink: 0; 
          display: block; 
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
        
        .shipping { background: #fff7ed; border: 1px solid #fed7aa; padding: 12px; border-radius: 10px; margin-bottom: 14px; }
        .ship-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .ship-field { display: grid; gap: 6px; }
        .ship-label { font-size: .85rem; color: #6b7280; }
        .ship-field input { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
        @media (max-width: 600px) { .ship-grid { grid-template-columns: 1fr; } }

        @media (max-width: 992px) { 
          .checkout-grid { grid-template-columns: 1fr; }
          .summary, .payments { margin-bottom: 1rem; }
        }
        @media (max-width: 768px) { 
          .checkout-section { padding: 10rem 1rem 2rem; }
          .checkout-container h1 { font-size: 1.8rem; margin-bottom: 1.5rem; }
          .auth-required { padding: 2rem 1.5rem; }
          .auth-required h2 { font-size: 1.5rem; }
          .auth-actions { flex-direction: column; }
          .auth-actions .btn { width: 100%; }
          .stripe-btn { padding: 14px 20px; font-size: 15px; }
          .ship-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) { 
          .checkout-section { padding: 9rem 0.75rem 1.5rem; }
          .checkout-container h1 { font-size: 1.6rem; }
          .auth-required { padding: 1.5rem 1rem; }
          .auth-icon { font-size: 3rem; }
          .auth-required h2 { font-size: 1.3rem; }
          .auth-benefits { padding: 1rem; }
          .auth-actions .btn { padding: 0.75rem 1.5rem; font-size: 0.95rem; }
          .summary, .payments { padding: 0.875rem; }
          .stripe-btn { padding: 12px 18px; font-size: 14px; gap: 8px; }
          .stripe-icon { width: 40px; height: 16px; }
        }

        /* Success Modal */
        .success-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .success-modal {
          background: white;
          border-radius: 20px;
          padding: 3rem 2rem;
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.4s ease;
          position: relative;
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: white;
          margin: 0 auto 1.5rem;
          animation: scaleIn 0.5s ease 0.2s both;
        }

        @keyframes scaleIn {
          from { 
            transform: scale(0);
          }
          to { 
            transform: scale(1);
          }
        }

        .success-modal h2 {
          font-size: 1.8rem;
          color: var(--color-navy);
          margin-bottom: 0.75rem;
        }

        .success-message {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .order-number {
          background: #f8f9fa;
          border: 2px dashed var(--color-brown);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .order-number .label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .order-number .value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-brown);
          font-family: 'Courier New', monospace;
          letter-spacing: 2px;
        }

        .success-details {
          background: #fff7ed;
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .success-details p {
          margin: 0.5rem 0;
          color: #555;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .success-btn {
          width: 100%;
          background: var(--color-brown);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(94, 54, 33, 0.3);
        }

        .success-btn:hover {
          background: #6d3d0f;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(94, 54, 33, 0.4);
        }

        @media (max-width: 480px) {
          .success-modal {
            padding: 2rem 1.5rem;
          }

          .success-icon {
            width: 70px;
            height: 70px;
            font-size: 2.5rem;
          }

          .success-modal h2 {
            font-size: 1.5rem;
          }

          .success-message {
            font-size: 1rem;
          }

          .order-number .value {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </main>
  )
}
