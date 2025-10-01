'use client'

import { useState } from 'react'

type ShowcaseProduct = {
  id: string
  name: string
  image: string
  price?: number
  subtitle?: string
}

const sampleProducts: ShowcaseProduct[] = [
  { id: '1', name: 'Pralina al Limoncello', subtitle: 'Ripieno cremoso al limone IGP', image: '/images/prodotto-3.svg', price: 2.9 },
  { id: '2', name: 'Tartufo Pistacchio', subtitle: 'Granella di pistacchio siciliano', image: '/images/prodotto-2.svg', price: 3.2 },
  { id: '3', name: 'Tavoletta 70%', subtitle: 'Fondente mono-origine 70%', image: '/images/prodotto-1.svg', price: 5.9 },
]

export default function ChocoShowcase() {
  const [active, setActive] = useState(0)

  const next = () => setActive((p) => (p + 1) % sampleProducts.length)
  const prev = () => setActive((p) => (p - 1 + sampleProducts.length) % sampleProducts.length)

  const current = sampleProducts[active]

  return (
    <section className="choco-showcase">
      <div className="choco-grid">
        <div className="choco-vertical">
          <img src="/images/instagram-2.svg" alt="Dettaglio cioccolato" />
        </div>
        <div className="choco-right">
          <div className="choco-square">
            <img src="/images/instagram-5.svg" alt="Particolare lavorazione" />
          </div>
          <div className="choco-carousel">
            <div className="choco-card">
              <img src={current.image} alt={current.name} />
              <div className="choco-info">
                <h3 className="choco-title">{current.name}</h3>
                {current.subtitle && <p className="choco-sub">{current.subtitle}</p>}
                {typeof current.price === 'number' && (
                  <div className="choco-price">€{current.price.toFixed(2)}</div>
                )}
                <a href="#shop" className="choco-cta">Acquistare ora</a>
              </div>
            </div>
            <div className="choco-nav">
              <div className="choco-arrows">
                <button aria-label="Prev" onClick={prev} className="choco-arrow">‹</button>
                <button aria-label="Next" onClick={next} className="choco-arrow">›</button>
              </div>
              <span className="choco-index">{active + 1} / {sampleProducts.length}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


