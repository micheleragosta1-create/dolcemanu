'use client'

import { useEffect, useRef, useState } from 'react'

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isReady, setIsReady] = useState(true) // Inizia come ready per mostrare subito
  const [hadError, setHadError] = useState(false)
  
  // Usa video locale per performance migliori
  const videoUrl = '/video/videoHP.mp4'

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    
    const onError = () => { 
      setHadError(true)
      console.warn('Errore caricamento video hero')
    }
    
    v.addEventListener('error', onError)
    
    // Autoplay best effort - più aggressivo
    const play = async () => {
      try {
        await v.play()
      } catch (err) {
        console.warn('Autoplay bloccato:', err)
      }
    }
    
    // Prova a fare play subito
    if (v.readyState >= 2) {
      play()
    } else {
      v.addEventListener('loadeddata', play, { once: true })
    }
    
    return () => {
      v.removeEventListener('error', onError)
    }
  }, [])

  return (
    <section className="hero hero-video">
      <div className="hero-video-container">
        <video
          ref={videoRef}
          className="hero-video-el is-ready"
          playsInline
          muted
          loop
          autoPlay
          preload="metadata"
          poster="/images/ondedicacao.png"
          disablePictureInPicture
          disableRemotePlayback
          x-webkit-airplay="deny"
        >
          {!hadError && <source src={videoUrl} type="video/mp4" />}
          {/* Fallback testo */}
          Il tuo browser non supporta il video HTML5.
        </video>
        <div className="hero-video-overlay">
          <div className="hero-content">
            <h1 className="poppins">Emozioni di Cioccolato</h1>
            <p>Artigianalità dalla Costiera Amalfitana, gusto e passione in ogni morso.</p>
            <a href="/shop" className="btn btn-primary">Scopri i Prodotti</a>
          </div>
        </div>
      </div>
    </section>
  )
}


