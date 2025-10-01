'use client'

import { useEffect } from 'react'

export default function Storia() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const elements = Array.from(document.querySelectorAll('.reveal-on-scroll')) as HTMLElement[]
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
        }
      })
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 })
    elements.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
  return (
    <section id="storia" className="storia-bg">
      <div className="storia-header reveal-on-scroll">
        <h2 className="storia-title">La mia passione</h2>
      </div>

      <div className="storia-layout">
        {/* Colonna sinistra: foto grande */}
        <div className="storia-portrait reveal-on-scroll">
          <img src="/images/manu.jpg" alt="Emanuela Napolitano" />
        </div>

        {/* Colonna destra: due box sovrapposti leggermente alla foto */}
        <div className="storia-right">
          <div className="storia-card top reveal-on-scroll delay-1">
            <h3 className="storia-hero">EMOZIONI CHE NASCONO DAL CIOCCOLATO</h3>
            <p>
              Tecniche contemporanee e ingredienti della Costiera Amalfitana si fondono
              per creare dolci dal carattere elegante e deciso.
            </p>
          </div>

          <div className="storia-card bottom reveal-on-scroll delay-2">
            <h4 className="storia-sub">LA MIA STORIA</h4>
            <p>
              Cresciuta tra profumi di agrumi e mare, trasformo ricordi ed emozioni in
              piccole opere d&apos;arte. Ogni creazione è pensata per regalare un momento unico.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
