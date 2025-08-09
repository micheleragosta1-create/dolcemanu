'use client'

import { useState, useEffect } from 'react'

const slides = [
  {
    id: 1,
    title: "Scopri la nuova collezione di praline al cioccolato \"Emozioni\".",
    description: "Creazioni raffinate che uniscono tradizione e innovazione",
    image: "/images/hero-slide-1.svg",
    cta: "Ordina Ora"
  },
  {
    id: 2,
    title: "L'arte della pasticceria che emoziona ad ogni morso",
    description: "Dolci artigianali creati con passione e ingredienti selezionati",
    image: "/images/hero-slide-2.svg",
    cta: "Ordina Ora"
  },
  {
    id: 3,
    title: "Regala emozioni con le nostre creazioni esclusive",
    description: "Box regalo personalizzati per ogni occasione speciale",
    image: "/images/hero-slide-3.svg",
    cta: "Ordina Ora"
  }
]

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [])

  const [isPaused, setIsPaused] = useState(false)
  
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isPaused])

  const goToSlide = (index: number) => setCurrentSlide(index)

  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX)
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > 50 && currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1)
    if (distance < -50 && currentSlide > 0) setCurrentSlide(currentSlide - 1)
  }

  return (
    <section className="hero">
      <div 
        className="hero-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="hero-slider"
          style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="hero-slide">
              <div className="hero-content">
                <h1 className="poppins">{slide.title}</h1>
                <p>{slide.description}</p>
                <a href="#shop" className="btn btn-primary">{slide.cta}</a>
              </div>
              <div 
                className="hero-image"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
            </div>
          ))}
        </div>
        <div className="carousel-navigation">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
