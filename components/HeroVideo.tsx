'use client'

import { useEffect, useRef, useState } from 'react'

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const [hadError, setHadError] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  
  const videoUrl = '/video/videoHP.mp4'

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    
    const onError = () => { 
      setHadError(true)
      console.warn('Errore caricamento video hero')
    }
    
    v.addEventListener('error', onError)
    
    const play = async () => {
      try {
        await v.play()
      } catch (err) {
        console.warn('Autoplay bloccato:', err)
      }
    }
    
    if (v.readyState >= 2) {
      play()
    } else {
      v.addEventListener('loadeddata', play, { once: true })
    }
    
    return () => {
      v.removeEventListener('error', onError)
    }
  }, [])

  // Effetto parallax al scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const parallaxOffset = scrollY * 0.4

  return (
    <section ref={sectionRef} className="hero hero-video hero-fullscreen">
      <div className="hero-video-container">
        <video
          ref={videoRef}
          className="hero-video-el is-ready"
          style={{ transform: `translateY(${parallaxOffset}px) scale(1.1)` }}
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
          Il tuo browser non supporta il video HTML5.
        </video>
        <div className="hero-video-overlay">
          <div className="hero-content">
            <span className="hero-label">Costiera Amalfitana</span>
            <h1 className="poppins">Emozioni di Cioccolato</h1>
            <p>Artigianalità e passione in ogni creazione</p>
            <a href="/shop" className="btn btn-primary">Scopri la Collezione</a>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Scorri</span>
        </div>
      </div>
    </section>
  )
}


