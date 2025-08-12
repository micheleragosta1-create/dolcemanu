"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useSwipe } from './useSwipe'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TouchIndicator, { TouchRipple } from './TouchIndicators'

interface ProductGalleryProps {
  images: string[]
  productName: string
  className?: string
}

export default function ProductGallery({ images, productName, className = '' }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showSwipeHint, setShowSwipeHint] = useState(true)

  // Per ora creiamo multiple view della stessa immagine per demo
  const galleryImages = images.length > 1 ? images : [
    images[0],
    images[0] + '?view=side', // Simula vista laterale
    images[0] + '?view=detail', // Simula dettaglio
  ]

  const goToNext = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [isTransitioning, galleryImages.length])

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [isTransitioning, galleryImages.length])

  const goToIndex = useCallback((index: number) => {
    if (index === currentIndex || isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [currentIndex, isTransitioning])

  const swipeHandlers = useSwipe({
    onSwipedLeft: () => {
      setShowSwipeHint(false)
      goToNext()
    },
    onSwipedRight: () => {
      setShowSwipeHint(false)
      goToPrevious()
    },
    delta: 30
  })

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevious, goToNext])

  if (galleryImages.length <= 1) {
    return (
      <div className={`simple-gallery ${className}`}>
        <div className="main-image">
          <Image src={galleryImages[0]} alt={productName} width={500} height={500} style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 16 }} />
        </div>
        <style jsx>{`
          .simple-gallery {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .main-image {
            width: 100%;
            max-width: 500px;
            aspect-ratio: 1/1;
            border-radius: 16px;
            background-size: cover;
            background-position: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className={`product-gallery ${className}`}>
      <div className="gallery-container" ref={swipeHandlers}>
        {/* Main Image */}
        <div className="main-image-container">
          <div className={`main-image ${isTransitioning ? 'transitioning' : ''}`}>
            <Image src={galleryImages[currentIndex]} alt={`${productName} - vista`} width={500} height={500} style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 16 }} />
          </div>
          
          {/* Navigation Arrows - Hidden on mobile for better swipe UX */}
          <button 
            className="nav-arrow nav-arrow-left desktop-only" 
            onClick={goToPrevious}
            disabled={isTransitioning}
            aria-label="Immagine precedente"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            className="nav-arrow nav-arrow-right desktop-only" 
            onClick={goToNext}
            disabled={isTransitioning}
            aria-label="Immagine successiva"
          >
            <ChevronRight size={24} />
          </button>

          {/* Touch Indicators */}
          {showSwipeHint && galleryImages.length > 1 && (
            <TouchIndicator 
              type="swipe" 
              direction="left" 
              className="swipe-hint-left"
              autoHide={true}
              delay={4000}
            />
          )}
          
          {showSwipeHint && galleryImages.length > 1 && (
            <TouchIndicator 
              type="swipe" 
              direction="right" 
              className="swipe-hint-right"
              autoHide={true}
              delay={4000}
            />
          )}
        </div>

        {/* Dots Indicator */}
        <div className="gallery-dots">
          {galleryImages.map((_, index) => (
            <TouchRipple key={index}>
              <button
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToIndex(index)}
                aria-label={`Vai all'immagine ${index + 1}`}
              />
            </TouchRipple>
          ))}
        </div>

        {/* Thumbnails - Hidden on mobile */}
        <div className="thumbnails desktop-only">
          {galleryImages.map((img, index) => (
            <TouchRipple key={index} disabled={isTransitioning}>
              <button
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToIndex(index)}
                disabled={isTransitioning}
                aria-label={`${productName} - Vista ${index + 1}`}
              >
                <Image src={img} alt={`${productName} miniatura ${index + 1}`} width={60} height={60} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
              </button>
            </TouchRipple>
          ))}
        </div>
      </div>

      <style jsx>{`
        .product-gallery {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .gallery-container {
          position: relative;
          user-select: none;
        }
        
        .main-image-container {
          position: relative;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .main-image {
          width: 100%;
          aspect-ratio: 1/1;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          touch-action: pan-y;
          overflow: hidden;
        }
        
        .main-image.transitioning {
          transform: scale(0.98);
        }
        
        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 2;
        }
        
        .nav-arrow:hover {
          background: white;
          transform: translateY(-50%) scale(1.05);
        }
        
        .nav-arrow:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: translateY(-50%) scale(1);
        }
        
        .nav-arrow-left {
          left: 1rem;
        }
        
        .nav-arrow-right {
          right: 1rem;
        }
        
        .swipe-hint-left {
          top: 50%;
          left: 2rem;
          transform: translateY(-50%);
        }
        
        .swipe-hint-right {
          top: 50%;
          right: 2rem;
          transform: translateY(-50%);
        }
        
        .swipe-indicator {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          animation: fadeInOut 3s ease-in-out infinite;
          pointer-events: none;
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          20%, 80% { opacity: 1; }
        }
        
        .gallery-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin: 1rem 0;
        }
        
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          background: #ddd;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .dot.active {
          background: var(--color-brown);
          transform: scale(1.2);
        }
        
        .thumbnails {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .thumbnail {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .thumbnail.active {
          border-color: var(--color-brown);
          transform: scale(1.05);
        }
        
        .thumbnail:hover:not(.active) {
          border-color: #ddd;
        }
        
        .thumbnail:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .desktop-only {
            display: none;
          }
          
          .mobile-only {
            display: block;
          }
          
          .main-image-container {
            max-width: 100%;
          }
          
          .gallery-dots {
            margin: 0.5rem 0;
          }
          
          .dot {
            width: 10px;
            height: 10px;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-only {
            display: none;
          }
          
          .desktop-only {
            display: flex;
          }
          
          .thumbnails.desktop-only {
            display: flex;
          }
        }
      `}</style>
    </div>
  )
}