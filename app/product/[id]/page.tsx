"use client"
export const dynamic = 'force-dynamic'
export const revalidate = 0

import type { Metadata } from 'next'
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useCartWithToast } from "@/components/useCartWithToast"
import { ProductPageSkeleton } from "@/components/Skeleton"
import { ArrowLeft } from "lucide-react"
import ProductGallery from "@/components/ProductGallery"
import ProductReviews from "@/components/ProductReviews"

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category?: string
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCartWithToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [qty, setQty] = useState(1)
  const [selectedBoxSize, setSelectedBoxSize] = useState<4 | 6 | 8 | 9 | 12>(4)
  const [carouselPosition, setCarouselPosition] = useState(0)

  useEffect(() => {
    const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)
    if (!id) return
    const run = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products/${id}`)
        if (res.ok) {
          const p = await res.json()
          setProduct(p)
        } else {
          // Fallback: carica tutti i prodotti e filtra per id
          const all = await fetch('/api/products')
          if (all.ok) {
            const list = await all.json()
            const p = (Array.isArray(list) ? list : []).find((x:any) => String(x.id) === String(id))
            if (p) {
              setProduct(p)
            } else {
              throw new Error('not found')
            }
          } else {
            throw new Error('not found')
          }
        }
      } catch (e) {
        setNotFound(true)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [params?.id, router])

  const related = useRelated(product)

  // Verifica se il prodotto è una pralina con formati box configurati
  const isBoxPraline = useMemo(() => {
    if (!product) return false
    const productData = product as any
    // È una pralina se ha il flag is_box_praline OPPURE se ha box_formats configurati
    const hasBoxFormats = productData.box_formats && 
      typeof productData.box_formats === 'object' && 
      Object.keys(productData.box_formats).length > 0
    return productData.is_box_praline === true || hasBoxFormats
  }, [product])

  // Calcola il prezzo in base alla dimensione del box
  // Supporta tutti i formati: 4, 8 (attivi) + 6, 9, 12 (dormienti/futuri)
  const boxPrices = useMemo(() => {
    if (!product) return { 4: 0, 8: 0, 6: 0, 9: 0, 12: 0 }
    
    // Se il prodotto ha formati box personalizzati dal database, usali
    const productData = product as any
    if (productData.box_formats && typeof productData.box_formats === 'object') {
      const formats = productData.box_formats
      return {
        4: formats['4'] || 0,
        8: formats['8'] || 0,
        6: formats['6'] || 0,
        9: formats['9'] || 0,
        12: formats['12'] || 0
      }
    }
    
    // Nessun formato configurato
    return { 4: 0, 8: 0, 6: 0, 9: 0, 12: 0 }
  }, [product])

  // Determina quali formati sono disponibili
  // Ordine: prima formati attivi (4, 8), poi dormienti (6, 9, 12)
  const availableFormats = useMemo(() => {
    // Se non è una pralina, non mostrare formati
    if (!isBoxPraline) return []
    
    const productData = product as any
    if (productData?.box_formats && typeof productData.box_formats === 'object') {
      // Mostra solo i formati con prezzo configurato > 0
      const formats = productData.box_formats
      // Tutti i formati supportati, ordinati per dimensione
      return [4, 6, 8, 9, 12].filter(size => formats[String(size)] !== undefined && formats[String(size)] > 0)
    }
    // Nessun formato configurato
    return []
  }, [product, isBoxPraline])

  // Prezzo corrente: usa il prezzo box se disponibile, altrimenti prezzo base
  const currentPrice = availableFormats.length > 0 && availableFormats.includes(selectedBoxSize) 
    ? boxPrices[selectedBoxSize] 
    : (product?.price || 0)

  // Assicura che il formato selezionato sia disponibile
  useEffect(() => {
    if (availableFormats.length > 0 && !availableFormats.includes(selectedBoxSize)) {
      setSelectedBoxSize(availableFormats[0] as 4 | 6 | 8 | 9 | 12)
    }
  }, [availableFormats, selectedBoxSize])

  const addToCart = () => {
    if (!product) return
    // Se è una pralina con formati, aggiungi il formato selezionato al nome
    const hasFormats = availableFormats.length > 0
    const productName = hasFormats 
      ? `${product.name} (${selectedBoxSize} praline)` 
      : product.name
    const productId = hasFormats 
      ? `${product.id}-${selectedBoxSize}` 
      : product.id
    
    addItem({ 
      id: productId, 
      nome: productName, 
      prezzo: currentPrice, 
      immagine: product.image_url 
    }, qty)
    if (typeof window !== 'undefined') {
      // GA4 event
      // @ts-ignore
      window.gtag && window.gtag('event','add_to_cart',{currency:'EUR', value: currentPrice*qty, items:[{item_id: productId, item_name:productName, price:currentPrice, quantity:qty}]})
      // Meta Pixel
      // @ts-ignore
      window.fbq && window.fbq('track','AddToCart',{content_ids:[productId], content_name:productName, currency:'EUR', value: currentPrice*qty})
    }
  }

  const nextCarousel = () => {
    if (!related) return
    const maxPosition = Math.max(0, related.length - 3) // Mostra 3 prodotti alla volta
    setCarouselPosition(prev => {
      const next = prev + 1
      const newPos = next > maxPosition ? maxPosition : next
      console.log('Next carousel:', { prev, next, maxPosition, newPos, totalItems: related.length })
      return newPos
    })
  }

  const prevCarousel = () => {
    setCarouselPosition(prev => Math.max(prev - 1, 0))
  }

  // Reset carosello quando cambiano i prodotti correlati
  useEffect(() => {
    setCarouselPosition(0)
  }, [related])

  return (
    <main>
      <Header />
      <section className="product-section">
        <div className="product-container">
          {!!product && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Product',
                  name: product.name,
                  image: product.image_url,
                  description: product.description,
                  brand: 'Onde di Cacao',
                  offers: {
                    '@type': 'Offer',
                    priceCurrency: 'EUR',
                    price: product.price,
                    availability: 'https://schema.org/InStock',
                    url: typeof window !== 'undefined' ? window.location.href : ''
                  }
                })
              }}
            />
          )}
          {loading ? (
            <ProductPageSkeleton />
          ) : notFound || !product ? (
            <>
              <button 
                className="back-button-product"
                onClick={() => router.push('/shop')}
                aria-label="Torna allo shop"
              >
                <ArrowLeft size={20} />
                <span>Torna allo shop</span>
              </button>
              <div className="loading">Prodotto non trovato. <a href="/shop" className="link">Torna allo shop</a></div>
            </>
          ) : (
            <>
              <button 
                className="back-button-product"
                onClick={() => router.push('/shop')}
                aria-label="Torna allo shop"
              >
                <ArrowLeft size={20} />
                <span>Torna allo shop</span>
              </button>
              {/* Breadcrumb JSON-LD */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                      { '@type': 'ListItem', position: 1, name: 'Home', item: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/' },
                      { '@type': 'ListItem', position: 2, name: 'Shop', item: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/shop' },
                      { '@type': 'ListItem', position: 3, name: product.category || 'Prodotti', item: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + `/shop?categoria=${product.category || 'tutti'}` },
                      { '@type': 'ListItem', position: 4, name: product.name, item: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + `/product/${product.id}` }
                    ]
                  })
                }}
              />
              <div className="product-grid">
                <ProductGallery 
                  images={
                    (product as any).images && Array.isArray((product as any).images) && (product as any).images.length > 0
                      ? (product as any).images
                      : [product.image_url]
                  }
                  productName={product.name}
                  className="product-gallery"
                />
                <div className="details">
                  <h1 className="poppins name">{product.name}</h1>
                  <p className="price">€ {currentPrice.toFixed(2)}</p>
                  <p className="desc">{product.description}</p>

                  {/* Selettore dimensione box */}
                  {availableFormats.length > 0 && (
                    <div className="box-size-selector">
                      <label className="box-size-label">Formato Box:</label>
                      <div className="box-size-options">
                        {availableFormats.map((size) => {
                          const price = boxPrices[size as keyof typeof boxPrices]
                          const isActive = selectedBoxSize === size
                          // Mostra badge "Conveniente" se il formato più grande ha prezzo/pezzo inferiore
                          const smallestFormat = availableFormats[0]
                          const smallestPrice = boxPrices[smallestFormat as keyof typeof boxPrices]
                          const isConvenient = size > smallestFormat && 
                            smallestPrice > 0 && 
                            (price / size) < (smallestPrice / smallestFormat)
                          
                          return (
                            <button
                              key={size}
                              className={`box-size-btn ${isActive ? 'active' : ''}`}
                              onClick={() => setSelectedBoxSize(size as 4 | 6 | 8 | 9 | 12)}
                            >
                              <span className="box-size-number">{size}</span>
                              <span className="box-size-text">praline</span>
                              <span className="box-size-price">€ {price.toFixed(2)}</span>
                              {isConvenient && (
                                <span className="box-size-badge">Conveniente</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="buy-row">
                    <input type="number" min={1} value={qty} onChange={e=>setQty(Math.max(1, parseInt(e.target.value||'1',10)))} className="qty" />
                    <button className="btn btn-primary" onClick={addToCart}>Aggiungi al carrello</button>
                  </div>

                  <div className="info-block">
                    <h3 className="poppins">Ingredienti</h3>
                    <p>{(product as any).ingredients || 'Cacao, zucchero, burro di cacao, latte in polvere, nocciole, pistacchi, aroma naturale di limone.'}</p>
                  </div>
                  <div className="info-block">
                    <h3 className="poppins">Allergeni</h3>
                    <p>{(product as any).allergens || 'Può contenere tracce di latte, frutta a guscio e soia.'}</p>
                  </div>
                  <div className="info-block">
                    <h3 className="poppins">Valori nutrizionali (100g)</h3>
                    {renderNutrition((product as any).nutrition)}
                  </div>
                  <ProductReviews productId={String(product.id)} />
                </div>
              </div>

              {!loading && related.length > 0 && (
                <div className="related">
                  <h2 className="poppins">Potrebbero piacerti</h2>
                  <div className="related-carousel">
                    <div className="carousel-container">
                      <div 
                        className="carousel-track"
                        style={{ 
                          transform: `translateX(-${carouselPosition * (280 + 24)}px)`,
                          width: `${related.length * (280 + 24)}px`
                        }}
                      >
                        {related.map((r, index) => (
                          <div key={r.id} className="related-card">
                            <a href={`/product/${r.id}`} className="card-link">
                              <div className="card-image">
                                <img src={r.image_url} alt={r.name} />
                                <div className="card-overlay">
                                  <span className="view-btn">Visualizza</span>
                                </div>
                              </div>
                              <div className="card-content">
                                <h3 className="card-title">{r.name}</h3>
                                <p className="card-price">€ {r.price.toFixed(2)}</p>
                                <div className="card-rating">
                                  <span className="stars">★★★★★</span>
                                  <span className="rating-text">(4.8)</span>
                                </div>
                              </div>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="carousel-controls">
                      <button 
                        className="carousel-btn prev-btn" 
                        onClick={prevCarousel}
                        disabled={carouselPosition === 0}
                        aria-label="Prodotti precedenti"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      
                      <div className="carousel-indicators">
                        {Array.from({ length: Math.max(1, related.length - 2) }, (_, i) => (
                          <button
                            key={i}
                            className={`indicator ${i === carouselPosition ? 'active' : ''}`}
                            onClick={() => setCarouselPosition(i)}
                            aria-label={`Vai al gruppo ${i + 1}`}
                          />
                        ))}
                      </div>
                      
                      <button 
                        className="carousel-btn next-btn" 
                        onClick={nextCarousel}
                        disabled={carouselPosition >= Math.max(0, related.length - 3)}
                        aria-label="Prodotti successivi"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />

      <style jsx global>{`
        .product-section {
          position: relative;
          z-index: 10;
          padding: var(--section-padding-top) var(--section-padding-x) var(--section-padding-bottom);
          min-height: calc(100vh - 200px);
        }
        .product-container { max-width: 1200px; margin: 0 auto; }
        
        /* Back Button */
        .back-button-product {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          color: var(--color-navy);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .back-button-product:hover {
          border-color: var(--color-brown);
          color: var(--color-brown);
          transform: translateX(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .back-button-product:active {
          transform: translateX(-2px);
        }

        .product-grid { display: grid; grid-template-columns: 2fr 3fr; gap: 2rem; }
        .product-gallery { width: 100%; }
        .details { display: grid; gap: 1rem; align-content: start; }
        .name { font-size: var(--h1-size); }
        .price { font-size: 1.5rem; font-weight: 700; color: var(--color-brown); }
        .desc { color: #555; line-height: 1.7; font-size: var(--body-size); }
        
        /* Box Size Selector */
        .box-size-selector {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.25rem;
          border: 2px solid #e9ecef;
        }
        
        .box-size-label {
          display: block;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--color-navy);
          margin-bottom: 0.75rem;
        }
        
        .box-size-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        
        .box-size-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 0.75rem;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .box-size-btn:hover {
          border-color: var(--color-brown);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .box-size-btn.active {
          border-color: var(--color-brown);
          background: var(--color-brown);
          color: white;
        }
        
        .box-size-number {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 0.25rem;
        }
        
        .box-size-text {
          font-size: 0.8rem;
          opacity: 0.8;
          margin-bottom: 0.5rem;
        }
        
        .box-size-price {
          font-size: 0.95rem;
          font-weight: 600;
        }
        
        .box-size-btn.active .box-size-price {
          color: white;
        }
        
        .box-size-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .buy-row { display: flex; gap: .75rem; align-items: center; }
        .qty { width: 80px; padding: .6rem .7rem; border: 2px solid #e9ecef; border-radius: 8px; }
        .info-block { background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 12px; padding: 1rem; }
        .info-block h3 { margin-bottom: .5rem; font-size: 1rem; }
        .nutri { list-style: none; padding: 0; margin: 0; display: grid; gap: .25rem; color: #555; }
        .related { 
          margin-top: 4rem; 
          padding-top: 2rem;
          border-top: 1px solid #e9ecef;
        }

        .related h2 {
          text-align: center;
          margin-bottom: 2.5rem;
          color: var(--color-navy);
          font-size: 2rem;
          font-weight: 600;
        }

        /* Related Products Carousel */
        .related-carousel {
          position: relative;
          margin: 0 auto;
          max-width: 100%;
        }

        .carousel-container {
          overflow: hidden;
          border-radius: 16px;
        }

        .carousel-track {
          display: flex;
          gap: 1.5rem;
          transition: transform 0.5s ease;
          padding: 1rem 0;
        }

        .related-card {
          flex: 0 0 280px;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          position: relative;
        }

        .related-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }

        .card-link {
          display: block;
          text-decoration: none;
          color: inherit;
        }

        .card-image {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .related-card:hover .card-image img {
          transform: scale(1.05);
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(139, 69, 19, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .related-card:hover .card-overlay {
          opacity: 1;
        }

        .view-btn {
          background: white;
          color: var(--color-brown);
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-content {
          padding: 1.5rem;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-navy);
          margin: 0 0 0.75rem 0;
          line-height: 1.3;
        }

        .card-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-brown);
          margin: 0 0 0.75rem 0;
        }

        .card-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stars {
          color: #ffc107;
          font-size: 1rem;
        }

        .rating-text {
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
        }

        /* Carousel Controls */
        .carousel-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .carousel-btn {
          width: 48px;
          height: 48px;
          border: 2px solid var(--color-brown);
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--color-brown);
        }

        .carousel-btn:hover {
          background: var(--color-brown);
          color: white;
          transform: scale(1.1);
        }

        .carousel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .carousel-indicators {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #ddd;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: var(--color-brown);
          border-color: var(--color-brown);
          transform: scale(1.2);
        }

        .indicator:hover {
          border-color: var(--color-brown);
          transform: scale(1.1);
        }
        
        @media (max-width: 992px) { 
          .back-button-product {
            font-size: 0.9rem;
            padding: 0.625rem 1rem;
            margin-bottom: 1rem;
          }

          .product-grid { 
            grid-template-columns: 1fr; 
            gap: 1.5rem;
          }

          .name {
            font-size: 1.75rem;
          }

          .price {
            font-size: 1.4rem;
          }
          
          .related-card {
            flex: 0 0 220px;
          }
          
          .card-image {
            height: 160px;
          }
        }

        @media (max-width: 768px) {
          .back-button-product {
            font-size: 0.85rem;
            padding: 0.5rem 0.875rem;
            border-radius: 10px;
          }

          .name {
            font-size: 1.5rem;
          }

          .price {
            font-size: 1.25rem;
          }

          .desc {
            font-size: 0.95rem;
          }

          .box-size-selector {
            padding: 1rem;
          }

          .box-size-options {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
          
          .box-size-btn {
            padding: 0.75rem 0.5rem;
          }
          
          .box-size-number {
            font-size: 1.4rem;
          }
          
          .box-size-text {
            font-size: 0.7rem;
          }

          .box-size-price {
            font-size: 0.85rem;
          }

          .related-card {
            flex: 0 0 180px;
          }
          
          .card-image {
            height: 140px;
          }

          .card-content {
            padding: 0.875rem;
          }
          
          .card-title {
            font-size: 0.9rem;
          }
          
          .card-price {
            font-size: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .name {
            font-size: 1.35rem;
          }

          .price {
            font-size: 1.15rem;
          }

          .desc {
            font-size: 0.9rem;
            line-height: 1.6;
          }

          .box-size-selector {
            padding: 0.75rem;
          }

          .box-size-options {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .box-size-btn {
            flex-direction: row;
            justify-content: space-between;
            padding: 0.75rem 1rem;
          }
          
          .box-size-number {
            font-size: 1.25rem;
          }
          
          .box-size-text {
            margin: 0 auto 0 0.5rem;
          }

          .related-card {
            flex: 0 0 160px;
          }
          
          .card-image {
            height: 120px;
          }
          
          .card-content {
            padding: 0.75rem;
          }
          
          .card-title {
            font-size: 0.85rem;
          }
          
          .card-price {
            font-size: 0.95rem;
          }
          
          .carousel-btn {
            width: 36px;
            height: 36px;
          }

          .indicator {
            width: 10px;
            height: 10px;
          }
        }
      `}</style>
    </main>
  )
}

function renderNutrition(nutrition?: any) {
  if (!nutrition || typeof nutrition !== 'object') {
    return (
      <ul className="nutri">
        <li>Energia: 2300 kJ / 550 kcal</li>
        <li>Grassi: 35 g (di cui saturi 21 g)</li>
        <li>Carboidrati: 50 g (di cui zuccheri 45 g)</li>
        <li>Proteine: 6 g</li>
        <li>Sale: 0.2 g</li>
      </ul>
    )
  }
  const v = nutrition
  return (
    <ul className="nutri">
      {v.energy_kcal != null && <li>Energia: {v.energy_kcal} kcal</li>}
      {v.fat != null && <li>Grassi: {v.fat} g {v.saturated_fat != null && <>(di cui saturi {v.saturated_fat} g)</>}</li>}
      {v.carbs != null && <li>Carboidrati: {v.carbs} g {v.sugars != null && <>(di cui zuccheri {v.sugars} g)</>}</li>}
      {v.protein != null && <li>Proteine: {v.protein} g</li>}
      {v.salt != null && <li>Sale: {v.salt} g</li>}
    </ul>
  )
}

function useRelated(product: Product | null) {
  const [items, setItems] = useState<Product[]>([])
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/products')
        const list = await res.json()
        setItems(Array.isArray(list) ? list : [])
      } catch { setItems([]) }
    }
    run()
  }, [])
  return useMemo(() => {
    if (!product) return []
    return items.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4)
  }, [items, product])
}


