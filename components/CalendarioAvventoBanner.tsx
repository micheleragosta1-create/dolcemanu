"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getSupabaseClient, type Product } from "@/lib/supabase"

export default function CalendarioAvventoBanner() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [daysUntilChristmas, setDaysUntilChristmas] = useState(0)

  useEffect(() => {
    // Calcola giorni fino a Natale
    const today = new Date()
    const christmas = new Date(today.getFullYear(), 11, 25) // 25 Dicembre
    if (today > christmas) {
      christmas.setFullYear(christmas.getFullYear() + 1)
    }
    const diffTime = christmas.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysUntilChristmas(diffDays)

    // Cerca il prodotto calendario dell'avvento
    async function fetchProduct() {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .is('deleted_at', null)
          .or('name.ilike.%calendario%,name.ilike.%avvento%,name.ilike.%advent%')
          .limit(1)
          .single()

        if (!error && data) {
          setProduct(data)
        }
      } catch (error) {
        console.error('Errore caricamento calendario:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [])

  // Non mostrare se siamo dopo Natale o se il prodotto non esiste
  if (loading) {
    return (
      <section className="advent-banner">
        <div className="advent-container">
          <div className="advent-skeleton">
            <div className="skeleton-shimmer"></div>
          </div>
        </div>
      </section>
    )
  }

  if (!product) return null

  const getDisplayPrice = () => {
    if (product.box_formats && Object.keys(product.box_formats).length > 0) {
      const prices = Object.values(product.box_formats)
      const minPrice = Math.min(...prices)
      return minPrice.toFixed(2)
    }
    return product.price.toFixed(2)
  }

  return (
    <section className="advent-banner">
      <div className="advent-snowflakes">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="snowflake" style={{ 
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}>❄</div>
        ))}
      </div>

      <div className="advent-container">
        <div className="advent-content">
          {/* Testo e CTA */}
          <div className="advent-text">
            <span className="advent-tag">
              🎄 Edizione Limitata Natale {new Date().getFullYear()}
            </span>
            
            <h2 className="advent-title poppins">
              Calendario dell'Avvento
              <span className="advent-subtitle">La Casetta di Pan di Zenzero</span>
            </h2>
            
            <p className="advent-description">
              24 cassetti magici con <strong>cioccolatini artigianali</strong>, 
              <strong> drops</strong> e <strong>tartufi</strong> pregiati. 
              Un dolce conto alla rovescia verso il Natale, 
              realizzato interamente a mano con ingredienti selezionati.
            </p>

            <div className="advent-features">
              <div className="feature">
                <span className="feature-icon">🍫</span>
                <span>24 Cioccolatini</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✨</span>
                <span>Fatto a mano</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🎁</span>
                <span>Confezione regalo</span>
              </div>
            </div>

            <div className="advent-countdown">
              <div className="countdown-badge">
                <span className="countdown-number">{daysUntilChristmas}</span>
                <span className="countdown-label">giorni a Natale</span>
              </div>
              <div className="advent-price">
                <span className="price-label">A partire da</span>
                <span className="price-value">€ {getDisplayPrice()}</span>
              </div>
            </div>

            <div className="advent-actions">
              <Link 
                href={`/product/${product.id}`} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #ffd700, #ffb700)',
                  color: '#1a472a',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>Scopri il Calendario</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link 
                href="/shop?collection=Natale" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                Tutti i prodotti Natale
              </Link>
            </div>
          </div>

          {/* Immagine Prodotto */}
          <div className="advent-image-wrapper">
            <div className="advent-image-glow"></div>
            <div className="advent-image-container">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="advent-image"
              />
              {product.is_new && (
                <span className="advent-badge-new">NOVITÀ</span>
              )}
            </div>
            <div className="advent-decorations">
              <span className="deco deco-1">🎅</span>
              <span className="deco deco-2">⭐</span>
              <span className="deco deco-3">🎁</span>
              <span className="deco deco-4">🔔</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .advent-banner {
          position: relative;
          background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 30%, #8b1538 70%, #5c0f24 100%);
          padding: 4rem 2rem;
          overflow: hidden;
        }

        .advent-snowflakes {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .snowflake {
          position: absolute;
          top: -20px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
          animation: fall linear infinite;
        }

        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .advent-container {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .advent-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .advent-text {
          color: white;
        }

        .advent-tag {
          display: inline-block;
          background: rgba(255, 215, 0, 0.2);
          border: 1px solid rgba(255, 215, 0, 0.4);
          color: #ffd700;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-bottom: 1.5rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .advent-title {
          font-size: 3rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .advent-subtitle {
          display: block;
          font-size: 1.5rem;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.85);
          margin-top: 0.5rem;
        }

        .advent-description {
          font-size: 1.1rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2rem;
        }

        .advent-description strong {
          color: #ffd700;
        }

        .advent-features {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.6rem 1rem;
          border-radius: 50px;
          font-size: 0.9rem;
        }

        .feature-icon {
          font-size: 1.2rem;
        }

        .advent-countdown {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .countdown-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          padding: 1rem 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .countdown-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: #ffd700;
          line-height: 1;
        }

        .countdown-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 0.25rem;
        }

        .advent-price {
          display: flex;
          flex-direction: column;
        }

        .price-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .price-value {
          font-size: 2rem;
          font-weight: 700;
          color: white;
        }

        .advent-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .advent-actions :global(a.advent-btn),
        .advent-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 2rem !important;
          border-radius: 50px !important;
          font-weight: 600 !important;
          font-size: 1rem !important;
          text-decoration: none !important;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .advent-actions :global(a.primary),
        .advent-btn.primary {
          background: linear-gradient(135deg, #ffd700, #ffb700) !important;
          color: #1a472a !important;
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
        }

        .advent-actions :global(a.primary:hover),
        .advent-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(255, 215, 0, 0.5);
          text-decoration: none !important;
        }

        .advent-actions :global(a.secondary),
        .advent-btn.secondary {
          background: rgba(255, 255, 255, 0.15) !important;
          color: white !important;
          border: 2px solid rgba(255, 255, 255, 0.4) !important;
        }

        .advent-actions :global(a.secondary:hover),
        .advent-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.25) !important;
          text-decoration: none !important;
        }

        /* Immagine */
        .advent-image-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .advent-image-glow {
          position: absolute;
          width: 80%;
          height: 80%;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
          filter: blur(40px);
          animation: glow 3s ease-in-out infinite alternate;
        }

        @keyframes glow {
          0% { opacity: 0.5; transform: scale(1); }
          100% { opacity: 0.8; transform: scale(1.1); }
        }

        .advent-image-container {
          position: relative;
          z-index: 1;
        }

        .advent-image {
          max-width: 100%;
          height: auto;
          max-height: 500px;
          object-fit: contain;
          border-radius: 20px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .advent-badge-new {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #ff4444;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 15px rgba(255, 68, 68, 0.4);
        }

        .advent-decorations {
          position: absolute;
          inset: -30px;
          pointer-events: none;
        }

        .deco {
          position: absolute;
          font-size: 2rem;
          animation: bounce 2s ease-in-out infinite;
        }

        .deco-1 { top: 0; left: 10%; animation-delay: 0s; }
        .deco-2 { top: 20%; right: 0; animation-delay: 0.3s; }
        .deco-3 { bottom: 10%; left: 0; animation-delay: 0.6s; }
        .deco-4 { bottom: 0; right: 15%; animation-delay: 0.9s; }

        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(10deg); }
        }

        /* Skeleton */
        .advent-skeleton {
          height: 400px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }

        .skeleton-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .advent-content {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }

          .advent-text {
            order: 2;
          }

          .advent-image-wrapper {
            order: 1;
          }

          .advent-features,
          .advent-countdown,
          .advent-actions {
            justify-content: center;
          }

          .advent-title {
            font-size: 2.5rem;
          }

          .advent-image {
            max-height: 350px;
          }
        }

        @media (max-width: 768px) {
          .advent-banner {
            padding: 3rem 1.5rem;
          }

          .advent-title {
            font-size: 2rem;
          }

          .advent-subtitle {
            font-size: 1.2rem;
          }

          .advent-description {
            font-size: 1rem;
          }

          .advent-features {
            gap: 0.75rem;
          }

          .feature {
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }

          .countdown-number {
            font-size: 2rem;
          }

          .price-value {
            font-size: 1.75rem;
          }

          .advent-actions :global(a.advent-btn),
          .advent-btn {
            padding: 0.875rem 1.5rem !important;
            font-size: 0.95rem !important;
          }

          .deco {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .advent-banner {
            padding: 2rem 1rem;
          }

          .advent-tag {
            font-size: 0.75rem;
            padding: 0.4rem 0.75rem;
          }

          .advent-title {
            font-size: 1.6rem;
          }

          .advent-subtitle {
            font-size: 1rem;
          }

          .advent-countdown {
            flex-direction: column;
            gap: 1rem;
          }

          .countdown-badge {
            width: 100%;
          }

          .advent-actions {
            flex-direction: column;
          }

          .advent-actions :global(a.advent-btn),
          .advent-btn {
            width: 100% !important;
            justify-content: center !important;
          }

          .advent-image {
            max-height: 280px;
          }

          .advent-decorations {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}

