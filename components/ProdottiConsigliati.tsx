"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { getSupabaseClient, type Product } from "@/lib/supabase"

// Badge minimalista
function ProductBadge({ product }: { product: Product }) {
  if (product.discount_percentage && product.discount_percentage > 0) {
    return <span className="hero-badge badge-sale">-{product.discount_percentage}%</span>
  }
  if (product.is_new) {
    return <span className="hero-badge badge-new">Nuovo</span>
  }
  if (product.is_bestseller) {
    return <span className="hero-badge badge-bestseller">Bestseller</span>
  }
  return null
}

// Skeleton loading minimal
function HeroSkeleton({ isMain = false }: { isMain?: boolean }) {
  return (
    <div className={`hero-product-card ${isMain ? 'hero-main' : 'hero-secondary'} skeleton-hero`}>
      <div className="hero-skeleton-image"></div>
      <div className="hero-skeleton-content">
        <div className="hero-skeleton-title"></div>
        <div className="hero-skeleton-desc"></div>
        <div className="hero-skeleton-price"></div>
      </div>
    </div>
  )
}

// Schema.org JSON-LD per SEO
function ProductStructuredData({ products }: { products: Product[] }) {
  const itemListElement = products.map((product, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "Product",
      "name": product.name,
      "image": product.image_url,
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "EUR",
        "availability": product.stock_quantity > 0 
          ? "https://schema.org/InStock" 
          : "https://schema.org/OutOfStock"
      }
    }
  }))

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Prodotti Consigliati - Dolce Manu",
    "description": "Selezione esclusiva dei nostri cioccolatini artigianali",
    "itemListElement": itemListElement
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export default function ProdottiConsigliati() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

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
        
        if (!data || data.length === 0) {
          setProducts([])
          return
        }

        // Trova il box grande da 20 praline miste
        const boxGrande = data.find(p => 
          p.name?.toLowerCase().includes('20') && 
          (p.name?.toLowerCase().includes('praline') || 
           p.name?.toLowerCase().includes('box') ||
           p.name?.toLowerCase().includes('regalo')) &&
          (p.chocolate_type === 'misto' || !p.chocolate_type)
        )

        // Se non trova il box grande, cerca almeno un prodotto con 20 pezzi
        const featuredProduct = boxGrande || data.find(p => 
          p.box_format === 12 || 
          p.name?.toLowerCase().includes('20') ||
          p.name?.toLowerCase().includes('regalo')
        ) || data[0] // Fallback al primo prodotto

        // Gli altri prodotti (escluso quello principale)
        const otherProducts = data
          .filter(p => p.id !== featuredProduct.id)
          .sort((a, b) => {
            // Prioritizza prodotti con badge
            const scoreA = (a.is_bestseller ? 3 : 0) + (a.is_new ? 2 : 0) + (a.discount_percentage ? 1 : 0)
            const scoreB = (b.is_bestseller ? 3 : 0) + (b.is_new ? 2 : 0) + (b.discount_percentage ? 1 : 0)
            return scoreB - scoreA
          })
          .slice(0, 2) // Prendi solo i primi 2

        // Array finale: box grande + 2 prodotti secondari
        setProducts([featuredProduct, ...otherProducts])
      } catch (error) {
        console.error('Errore caricamento prodotti:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Intersection Observer per animazione ingresso
  useEffect(() => {
    // Fallback: rendi visibile dopo 1 secondo se l'observer non ha triggerato
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          clearTimeout(fallbackTimer)
        }
      },
      { 
        threshold: 0.05, // Ridotto per mobile
        rootMargin: '150px' // Aumentato per triggerare prima
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      observer.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [])

  if (loading) {
    return (
      <section id="shop" className={`hero-section ${isVisible ? 'visible' : ''}`} ref={sectionRef}>
        <div className="hero-container">
          <div className="hero-header">
            <h2 className="hero-title">I Nostri Prodotti Consigliati</h2>
            <p className="hero-subtitle">
              Selezione esclusiva dei nostri cioccolatini artigianali
            </p>
          </div>
          <div className="hero-split-layout">
            <HeroSkeleton isMain={true} />
            <div className="hero-sidebar">
              <HeroSkeleton isMain={false} />
              <HeroSkeleton isMain={false} />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section id="shop" className={`hero-section ${isVisible ? 'visible' : ''}`} ref={sectionRef}>
        <div className="hero-container">
          <div className="hero-header">
            <h2 className="hero-title">I Nostri Prodotti Consigliati</h2>
            <p className="hero-subtitle">
              Nessun prodotto disponibile al momento
            </p>
          </div>
        </div>
      </section>
    )
  }

  const mainProduct = products[0]
  const sideProducts = products.slice(1, 3)

  return (
    <>
      <ProductStructuredData products={products} />
      <section 
        id="shop" 
        className={`hero-section ${isVisible ? 'visible' : ''}`}
        ref={sectionRef}
      >
        <div className="hero-container">
          <div className="hero-header">
            <span className="hero-tag">✨ Selezione Esclusiva</span>
            <h2 className="hero-title poppins">I Nostri Prodotti Consigliati</h2>
            <p className="hero-subtitle">
              Tre eccellenze artigianali selezionate per offrirti il meglio della nostra tradizione cioccolatiera
            </p>
          </div>

          <div className="hero-split-layout">
            {/* PRODOTTO PRINCIPALE - 70% */}
            <article
              className="hero-product-card hero-main"
            >
              <Link href={`/product/${mainProduct.id}`} className="hero-image-wrapper">
                <div className="hero-image-container">
                  <img
                    src={mainProduct.image_url}
                    alt={`${mainProduct.name} - Cioccolatini artigianali Dolce Manu`}
                    className="hero-image"
                    loading="eager"
                    itemProp="image"
                  />
                  <div className="hero-image-overlay"></div>
                  <ProductBadge product={mainProduct} />
                </div>
              </Link>
              
                  <div className="hero-content">
                    <Link href={`/product/${mainProduct.id}`}>
                      <h3 className="hero-product-title poppins">
                        {mainProduct.name}
                      </h3>
                    </Link>
                
                <div className="hero-footer">
                  <div className="hero-actions">
                    <Link href="/shop" className="hero-btn-primary">
                      Scopri di più
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            {/* PRODOTTI SECONDARI - 30% */}
            <div className="hero-sidebar">
              {sideProducts.map((product, index) => (
                <article
                  key={product.id}
                  className="hero-product-card hero-secondary"
                  style={{ animationDelay: `${(index + 1) * 0.15}s` }}
                >
                  <Link href={`/product/${product.id}`} className="hero-image-wrapper">
                    <div className="hero-image-container">
                      <img
                        src={product.image_url}
                        alt={`${product.name} - Cioccolatini artigianali Dolce Manu`}
                        className="hero-image"
                        loading="lazy"
                        itemProp="image"
                      />
                      <div className="hero-image-overlay"></div>
                      <ProductBadge product={product} />
                    </div>
                  </Link>
                  
                  <div className="hero-content">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="hero-product-title poppins">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="hero-footer">
                      <Link href="/shop" className="hero-btn-icon" title="Scopri di più">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-cta">
            <Link href="/shop" className="hero-btn-cta">
              <span>Vedi tutti i prodotti</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
