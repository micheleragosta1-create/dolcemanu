'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

export default function HeroCarouselVideo() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const slides = [
    {
      type: 'video' as const,
      src: '/video/videoHP.mp4',
      poster: '/images/ondedicacao.png',
      title: 'Emozioni di Cioccolato',
      description: 'Artigianalità dalla Costiera Amalfitana, gusto e passione in ogni morso.',
      cta: 'Scopri i Prodotti',
      link: '/shop'
    },
    {
      type: 'image' as const,
      src: '/images/advent-calendar.jpg',
      fallback: '/images/ondedicacao2.png', // Fallback se l'immagine non esiste
      title: 'Calendario dell\'Avvento',
      description: 'Aspetta il Natale giorno per giorno con dolcezza. 24 deliziose sorprese in una casetta di cioccolato.',
      cta: 'Scopri il Calendario',
      link: '/shop?collection=Calendario%20dell\'Avvento',
      badge: '🎄 Edizione Limitata'
    }
  ]

  // Auto-play carousel
  useEffect(() => {
    if (isPlaying && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length)
      }, 8000) // Cambia ogni 8 secondi
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, isPaused, slides.length])

  // Gestisci autoplay video
  useEffect(() => {
    if (currentSlide === 0 && videoRef.current) {
      videoRef.current.play().catch(() => console.warn('Autoplay video bloccato'))
    }
  }, [currentSlide])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsPlaying(true)
  }

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length)
  }

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length)
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Se l'immagine del calendario non carica, usa il fallback
    const imgElement = e.target as HTMLImageElement
    const slide = slides[currentSlide]
    if (slide.type === 'image' && slide.fallback) {
      imgElement.src = slide.fallback
    }
  }

  return (
    <section className="hero hero-carousel-video">
      <div 
        className="hero-carousel-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides */}
        <div className="hero-slides-wrapper">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`hero-carousel-slide ${currentSlide === index ? 'active' : ''}`}
            >
              {slide.type === 'video' ? (
                <video
                  ref={index === 0 ? videoRef : null}
                  className="hero-media hero-video-el"
                  playsInline
                  muted
                  loop
                  autoPlay
                  preload="metadata"
                  poster={slide.poster}
                  disablePictureInPicture
                  disableRemotePlayback
                  x-webkit-airplay="deny"
                >
                  <source src={slide.src} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={slide.src}
                  alt={slide.title}
                  className="hero-media hero-image-el"
                  onError={handleImageError}
                  loading="eager"
                />
              )}

              {/* Overlay e contenuto */}
              <div className="hero-video-overlay">
                <div className="hero-content">
                  {slide.type === 'image' && slide.badge && (
                    <div className="hero-badge">{slide.badge}</div>
                  )}
                  <h1 className="poppins">{slide.title}</h1>
                  <p>{slide.description}</p>
                  <a href={slide.link} className="btn btn-primary">
                    {slide.cta}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controlli navigazione */}
        <button
          className="hero-carousel-arrow hero-carousel-arrow-left"
          onClick={prevSlide}
          aria-label="Slide precedente"
        >
          <ChevronLeft size={28} />
        </button>

        <button
          className="hero-carousel-arrow hero-carousel-arrow-right"
          onClick={nextSlide}
          aria-label="Slide successiva"
        >
          <ChevronRight size={28} />
        </button>

        {/* Indicatori */}
        <div className="hero-carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-carousel-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Vai alla slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Play/Pause */}
        <button
          className="hero-carousel-play-pause"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pausa' : 'Riproduci'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>
    </section>
  )
}

