'use client'

import { Gift, Calendar, Sparkles } from 'lucide-react'
import { useState } from 'react'

export default function AdventCalendarBanner() {
  const [imgError, setImgError] = useState(false)
  
  // Usa l'immagine PNG del calendario, poi fallback
  const imageSrc = imgError 
    ? '/images/ondedicacao2.png' 
    : '/images/advent-calendar.png'

  return (
    <section className="advent-banner">
      <div className="advent-banner-container">
        {/* Immagine del calendario */}
        <div className="advent-banner-image">
          <img 
            src={imageSrc}
            alt="Calendario dell'Avvento Onde di Cacao - Casetta di cioccolato"
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ 
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
          />
          <div className="advent-banner-badge">
            <Sparkles size={20} />
            <span>Edizione Limitata</span>
          </div>
        </div>

        {/* Contenuto testuale */}
        <div className="advent-banner-content">
          <div className="advent-banner-icon">
            <Gift size={40} />
          </div>
          
          <h2 className="advent-banner-title">
            Calendario dell'Avvento
          </h2>
          
          <p className="advent-banner-subtitle">
            Aspetta il Natale giorno per giorno con dolcezza
          </p>
          
          <p className="advent-banner-description">
            Una magica casetta di cioccolato con 24 deliziose sorprese. 
            Ogni giorno una nuova emozione fino alla Vigilia di Natale.
          </p>

          <div className="advent-banner-features">
            <div className="advent-feature">
              <Calendar size={18} />
              <span>24 Cioccolatini</span>
            </div>
            <div className="advent-feature">
              <Gift size={18} />
              <span>Artigianale</span>
            </div>
            <div className="advent-feature">
              <Sparkles size={18} />
              <span>Made in Italy</span>
            </div>
          </div>

          <a href="/shop?collection=Calendario%20dell'Avvento" className="btn btn-advent">
            <Gift size={18} />
            Scopri il Calendario
          </a>
        </div>
      </div>
    </section>
  )
}

