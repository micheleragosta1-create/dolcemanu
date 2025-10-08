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
    <section id="storia" className="storia-section">
      <div className="storia-container">
        {/* Header sezione */}
        <div className="storia-header reveal-on-scroll">
          <h2 className="storia-title">La mia passione</h2>
          <p className="storia-subtitle">
            Artigianato dolciario dalla Costiera Amalfitana
          </p>
        </div>

        {/* Layout principale: immagine grande + testo */}
        <div className="storia-main">
          <div className="storia-image-wrapper reveal-on-scroll">
            <img 
              src="/images/manu.jpg" 
              alt="Emanuela Napolitano - Pastry Chef"
              className="storia-image"
            />
            <div className="storia-badge">
              <span>Pastry Chef</span>
            </div>
          </div>

          <div className="storia-content reveal-on-scroll delay-1">
            <h3 className="storia-name">Emanuela Napolitano</h3>
            <div className="storia-text">
              <p>
                Sono cresciuta tra i profumi degli agrumi e del mare della Costiera Amalfitana,
                dove ho imparato a trasformare ingredienti locali in creazioni dolciarie uniche.
              </p>
              <p>
                Ogni dolce che creo racconta una storia di passione, tradizione e innovazione.
                Tecniche contemporanee si fondono con ricette tramandate per regalare emozioni
                autentiche ad ogni morso.
              </p>
              <p>
                La mia filosofia è semplice: ingredienti di prima qualità, lavorazione artigianale
                e amore per il dettaglio. Ogni creazione è pensata per essere un&apos;esperienza
                indimenticabile.
              </p>
            </div>
            <a href="/shop" className="storia-cta btn btn-primary">
              Scopri le mie creazioni
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
