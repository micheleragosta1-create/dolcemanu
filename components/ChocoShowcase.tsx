'use client'

import { useEffect, useRef, useState } from 'react'

export default function ChocoShowcase() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
    
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className={`choco-showcase ${isVisible ? 'is-visible' : ''}`}>
      <div className="choco-header">
        <span className="choco-label">La Nostra Arte</span>
        <h2 className="poppins">Creazioni Artigianali</h2>
        <p>Ogni praline racconta una storia di passione e tradizione</p>
      </div>
      <div className="choco-grid">
        <div className="choco-vertical">
          <img src="/images/img_praline_costiera.png" alt="Praline della Costiera" />
          <div className="choco-vertical-overlay">
            <span className="overlay-text">Praline della Costiera</span>
          </div>
        </div>
        <div className="choco-right">
          <div className="choco-square">
            <video 
              className="choco-video"
              autoPlay 
              muted 
              loop 
              playsInline
              poster="/images/instagram-5.svg"
            >
              <source src="/video/4458586-hd_1920_1080_24fps.mp4" type="video/mp4" />
              <img src="/images/instagram-5.svg" alt="Particolare lavorazione" />
            </video>
            <div className="choco-video-overlay">
              <span className="overlay-text">Lavorazione Artigianale</span>
            </div>
          </div>
        </div>
      </div>
      <div className="choco-cta-section">
        <a href="/shop" className="btn btn-outline-dark">Scopri Tutti i Prodotti</a>
      </div>
    </section>
  )
}


