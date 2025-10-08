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
import Breadcrumbs from "@/components/Breadcrumbs"
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
  const [selectedBoxSize, setSelectedBoxSize] = useState<6 | 9 | 12>(6)

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

  // Calcola il prezzo in base alla dimensione del box
  const boxPrices = useMemo(() => {
    if (!product) return { 6: 0, 9: 0, 12: 0 }
    const basePrice = product.price
    return {
      6: basePrice,
      9: basePrice * 1.4, // circa 40% in più
      12: basePrice * 1.75 // circa 75% in più
    }
  }, [product])

  const currentPrice = boxPrices[selectedBoxSize]

  const addToCart = () => {
    if (!product) return
    const productName = `${product.name} (${selectedBoxSize} praline)`
    addItem({ 
      id: `${product.id}-${selectedBoxSize}`, 
      nome: productName, 
      prezzo: currentPrice, 
      immagine: product.image_url 
    }, qty)
    if (typeof window !== 'undefined') {
      // GA4 event
      // @ts-ignore
      window.gtag && window.gtag('event','add_to_cart',{currency:'EUR', value: currentPrice*qty, items:[{item_id:`${product.id}-${selectedBoxSize}`, item_name:productName, price:currentPrice, quantity:qty}]})
      // Meta Pixel
      // @ts-ignore
      window.fbq && window.fbq('track','AddToCart',{content_ids:[`${product.id}-${selectedBoxSize}`], content_name:productName, currency:'EUR', value: currentPrice*qty})
    }
  }

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
              <Breadcrumbs 
                items={[
                  { label: "Shop", href: "/shop" },
                  { label: "Prodotto non trovato", current: true }
                ]} 
              />
              <div className="loading">Prodotto non trovato. <a href="/shop" className="link">Torna allo shop</a></div>
            </>
          ) : (
            <>
              <Breadcrumbs 
                items={[
                  { label: "Shop", href: "/shop" },
                  { label: product.category || "Prodotti", href: `/shop?categoria=${product.category || 'tutti'}` },
                  { label: product.name, current: true }
                ]} 
              />
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
                  images={[product.image_url]} 
                  productName={product.name}
                  className="product-gallery"
                />
                <div className="details">
                  <h1 className="poppins name">{product.name}</h1>
                  <p className="price">€ {currentPrice.toFixed(2)}</p>
                  <p className="desc">{product.description}</p>

                  {/* Selettore dimensione box */}
                  <div className="box-size-selector">
                    <label className="box-size-label">Formato Box:</label>
                    <div className="box-size-options">
                      <button
                        className={`box-size-btn ${selectedBoxSize === 6 ? 'active' : ''}`}
                        onClick={() => setSelectedBoxSize(6)}
                      >
                        <span className="box-size-number">6</span>
                        <span className="box-size-text">praline</span>
                        <span className="box-size-price">€ {boxPrices[6].toFixed(2)}</span>
                      </button>
                      <button
                        className={`box-size-btn ${selectedBoxSize === 9 ? 'active' : ''}`}
                        onClick={() => setSelectedBoxSize(9)}
                      >
                        <span className="box-size-number">9</span>
                        <span className="box-size-text">praline</span>
                        <span className="box-size-price">€ {boxPrices[9].toFixed(2)}</span>
                      </button>
                      <button
                        className={`box-size-btn ${selectedBoxSize === 12 ? 'active' : ''}`}
                        onClick={() => setSelectedBoxSize(12)}
                      >
                        <span className="box-size-number">12</span>
                        <span className="box-size-text">praline</span>
                        <span className="box-size-price">€ {boxPrices[12].toFixed(2)}</span>
                        {boxPrices[12] < boxPrices[6] * 2 && (
                          <span className="box-size-badge">Conveniente</span>
                        )}
                      </button>
                    </div>
                  </div>

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
                  <div className="related-grid">
                    {related.map(r => (
                      <a key={r.id} className="related-card" href={`/product/${r.id}`}>
                        <div className="img" style={{ backgroundImage: `url(${r.image_url})` }} />
                        <div className="meta">
                          <span className="title">{r.name}</span>
                          <span className="r-price">€ {r.price.toFixed(2)}</span>
                        </div>
                      </a>
                    ))}
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
          padding: 7rem 2rem 8rem;
          min-height: calc(100vh - 200px);
        }
        .product-container { max-width: 1200px; margin: 0 auto; }
        .product-grid { display: grid; grid-template-columns: 2fr 3fr; gap: 2rem; }
        .product-gallery { width: 100%; }
        .details { display: grid; gap: 1rem; align-content: start; }
        .name { font-size: 2rem; }
        .price { font-size: 1.6rem; font-weight: 700; color: var(--color-brown); }
        .desc { color: #555; line-height: 1.7; }
        
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
        .related { margin-top: 3rem; }
        .related-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
        .related-card { background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 12px; overflow: hidden; text-decoration: none; color: inherit; transition: transform .2s ease; }
        .related-card:hover { transform: translateY(-3px); }
        .related-card .img { width: 100%; height: 160px; background-size: cover; background-position: center; }
        .related-card .meta { display: flex; justify-content: space-between; padding: .75rem; }
        
        @media (max-width: 992px) { 
          .product-grid { grid-template-columns: 1fr; }
        }
        
        @media (max-width: 600px) {
          .box-size-options {
            grid-template-columns: 1fr;
          }
          
          .box-size-btn {
            flex-direction: row;
            justify-content: space-between;
            padding: 0.875rem 1rem;
          }
          
          .box-size-number {
            font-size: 1.5rem;
          }
          
          .box-size-text {
            margin: 0 auto 0 0.5rem;
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


