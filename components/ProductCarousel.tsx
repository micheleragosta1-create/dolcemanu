"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { getSupabaseClient, type Product } from "@/lib/supabase"

type TabType = 'bestseller' | 'novita' | 'natale'

export default function ProductCarousel() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('bestseller')
  const [scrollProgress, setScrollProgress] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error('Errore caricamento prodotti:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filtra prodotti in base alla tab attiva
  const filteredProducts = products.filter(product => {
    switch (activeTab) {
      case 'bestseller':
        return product.is_bestseller
      case 'novita':
        return product.is_new
      case 'natale':
        return product.collection === 'Natale'
      default:
        return true
    }
  })

  // Se non ci sono prodotti per la tab, mostra tutti
  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products.slice(0, 8)

  // Gestione scroll
  const updateScrollState = () => {
    if (!carouselRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    const maxScroll = scrollWidth - clientWidth
    
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < maxScroll - 10)
    setScrollProgress(maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0)
  }

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    carousel.addEventListener('scroll', updateScrollState)
    // Initial check
    setTimeout(updateScrollState, 100)

    return () => carousel.removeEventListener('scroll', updateScrollState)
  }, [displayProducts])

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    
    const cardWidth = 280 + 24 // card width + gap
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2
    
    carouselRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    })
  }

  // Calcola prezzo display
  const getDisplayPrice = (product: Product) => {
    if (product.box_formats && Object.keys(product.box_formats).length > 0) {
      const prices = Object.values(product.box_formats)
      const minPrice = Math.min(...prices)
      return `da ${minPrice.toFixed(2)} €`
    }
    return `${product.price.toFixed(2)} €`
  }

  if (loading) {
    return (
      <section className="omega-carousel-section">
        <div className="omega-carousel-container">
          <div className="omega-carousel-header">
            <div className="omega-tabs">
              <button className="omega-tab active">BESTSELLERS</button>
              <button className="omega-tab">NOVITÀ</button>
              <button className="omega-tab">NATALE</button>
            </div>
          </div>
          <div className="omega-carousel">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="omega-product-card skeleton">
                <div className="omega-product-image skeleton-img"></div>
                <div className="omega-product-info">
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text small"></div>
                  <div className="skeleton-text price"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="omega-carousel-section">
      <div className="omega-carousel-container">
        {/* Tabs Header */}
        <div className="omega-carousel-header">
          <div className="omega-tabs">
            <button 
              className={`omega-tab ${activeTab === 'bestseller' ? 'active' : ''}`}
              onClick={() => setActiveTab('bestseller')}
            >
              BESTSELLERS
            </button>
            <button 
              className={`omega-tab ${activeTab === 'novita' ? 'active' : ''}`}
              onClick={() => setActiveTab('novita')}
            >
              NOVITÀ
            </button>
            <button 
              className={`omega-tab ${activeTab === 'natale' ? 'active' : ''}`}
              onClick={() => setActiveTab('natale')}
            >
              NATALE
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="omega-carousel-wrapper">
          <div 
            ref={carouselRef}
            className="omega-carousel"
          >
            {displayProducts.map((product, index) => (
              <Link 
                href={`/product/${product.id}`} 
                key={product.id}
                className="omega-product-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Badge */}
                {product.is_new && (
                  <span className="omega-badge">NOVITÀ</span>
                )}
                
                {/* Immagine */}
                <div className="omega-product-image">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    loading={index < 4 ? "eager" : "lazy"}
                  />
                </div>
                
                {/* Info */}
                <div className="omega-product-info">
                  <h3 className="omega-product-name">{product.name}</h3>
                  {product.collection && (
                    <p className="omega-product-collection">{product.collection}</p>
                  )}
                  <p className="omega-product-price">{getDisplayPrice(product)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Progress bar e frecce */}
        <div className="omega-carousel-controls">
          <div className="omega-progress-container">
            <div 
              className="omega-progress-bar"
              style={{ width: `${Math.max(20, scrollProgress)}%` }}
            ></div>
          </div>
          
          <div className="omega-arrows">
            <button 
              className={`omega-arrow ${!canScrollLeft ? 'disabled' : ''}`}
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scorri a sinistra"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className={`omega-arrow ${!canScrollRight ? 'disabled' : ''}`}
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scorri a destra"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

