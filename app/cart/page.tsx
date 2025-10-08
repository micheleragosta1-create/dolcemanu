"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useCart } from "@/components/CartContext"

export default function CartPage() {
  const { items, totalAmount, totalQty, updateQty, removeItem, clear } = useCart()

  return (
    <main>
      <Header />
      <section className="cart-section">
        <div className="cart-container">
          <h1 className="poppins">Il tuo carrello</h1>
          {items.length === 0 ? (
            <p>Il carrello è vuoto.</p>
          ) : (
            <div className="cart-grid">
              <div className="cart-list">
                {items.map((i) => (
                  <article key={i.id} className="cart-row">
                    <div className="cart-thumb" style={{ backgroundImage: `url(${i.immagine})` }} />
                    <div className="cart-info">
                      <h3 className="poppins">{i.nome}</h3>
                      <p>€ {i.prezzo.toFixed(2)}</p>
                      {i.tipo && <span className="badge">{i.tipo}</span>} {i.pezzi && <span className="badge">{i.pezzi} pz</span>}
                    </div>
                    <div className="cart-actions">
                      <input
                        type="number"
                        min={1}
                        value={i.qty}
                        onChange={(e) => updateQty(i.id, parseInt(e.target.value || '1', 10))}
                        className="qty"
                      />
                      <button className="btn btn-secondary" onClick={() => removeItem(i.id)}>Rimuovi</button>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="cart-summary">
                <h2 className="poppins">Riepilogo</h2>
                <div className="line"><span>Totale articoli</span><strong>{totalQty}</strong></div>
                <div className="line"><span>Totale</span><strong>€ {totalAmount.toFixed(2)}</strong></div>
                <button className="btn btn-primary" onClick={() => window.location.href = '/checkout'}>Procedi al pagamento</button>
                <button className="btn btn-secondary" onClick={clear} style={{ marginTop: '.5rem' }}>Svuota carrello</button>
              </aside>
            </div>
          )}
        </div>
      </section>
      <Footer />

      <style jsx global>{`
        .cart-section { position: relative; z-index: 10; padding: 13rem 2rem 3rem; }
        .cart-container { max-width: 1100px; width: min(1100px, 100%); margin-inline: auto; }
        .cart-grid { 
          display: grid; 
          grid-template-columns: minmax(320px, 720px) 360px; 
          gap: 1.5rem; 
          align-items: start; 
          justify-content: center;
          max-width: 1100px;
          margin-inline: auto;
        }
        .cart-list { display: grid; gap: .75rem; width: 100%; max-width: 720px; margin-inline: auto; }
        .cart-row { display: grid; grid-template-columns: 120px 1fr auto; gap: 1rem; background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 12px; padding: .75rem; }
        .cart-thumb { width: 120px; height: 90px; background-size: cover; background-position: center; border-radius: 8px; }
        .badge { background: #f5f3f0; border: 1px solid #e8e3dd; border-radius: 999px; padding: .15rem .5rem; font-size: .75rem; margin-left: .25rem; }
        .cart-actions { display: grid; gap: .5rem; align-items: start; }
        .qty { width: 80px; padding: .4rem .6rem; border: 2px solid #e9ecef; border-radius: 8px; }
        .cart-summary { background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 12px; padding: 1rem; height: fit-content; box-shadow: 0 10px 30px rgba(0,0,0,.06); }
        .line { display: flex; justify-content: space-between; margin: .35rem 0; }
        @media (max-width: 992px) { 
          .cart-grid { grid-template-columns: 1fr; }
          .cart-list { max-width: 100%; }
          .cart-summary { width: 100%; max-width: 480px; margin-inline: auto; }
        }
      `}</style>
    </main>
  )
}
