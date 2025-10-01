'use client'

import { useEffect, useRef, useState } from 'react'

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [hadError, setHadError] = useState(false)
  const videoUrl = (process.env.NEXT_PUBLIC_HERO_VIDEO_URL as string) || 'https://www.pexels.com/it-it/download/video/4458664/'

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onCanPlay = () => setIsReady(true)
    const onLoadedMeta = () => setIsReady(true)
    const onError = () => { setHadError(true); setIsReady(true) }
    v.addEventListener('canplay', onCanPlay)
    v.addEventListener('loadedmetadata', onLoadedMeta)
    v.addEventListener('error', onError)
    // Autoplay best effort
    const play = async () => {
      try {
        await v.play()
      } catch {}
    }
    play()
    return () => {
      v.removeEventListener('canplay', onCanPlay)
      v.removeEventListener('loadedmetadata', onLoadedMeta)
      v.removeEventListener('error', onError)
    }
  }, [])

  return (
    <section className="hero hero-video">
      <div className="hero-video-container">
        <video
          ref={videoRef}
          className={`hero-video-el ${isReady ? 'is-ready' : ''}`}
          playsInline
          muted
          loop
          autoPlay
          preload="auto"
          poster="/images/ondedicacao.png"
        >
          {!hadError && <source src={videoUrl} type="video/mp4" />}
          {/* Fallback testo */}
          Il tuo browser non supporta il video HTML5.
        </video>
        <div className="hero-video-overlay">
          <div className="hero-content">
            <h1 className="poppins">Emozioni di Cioccolato</h1>
            <p>Artigianalità dalla Costiera Amalfitana, gusto e passione in ogni morso.</p>
            <a href="#shop" className="btn btn-primary">Ordina Ora</a>
          </div>
        </div>
      </div>
    </section>
  )
}


