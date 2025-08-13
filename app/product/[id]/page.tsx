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

  const addToCart = () => {
    if (!product) return
    addItem({ id: String(product.id), nome: product.name, prezzo: product.price, immagine: product.image_url }, qty)
    if (typeof window !== 'undefined') {
      // GA4 event
      // @ts-ignore
      window.gtag && window.gtag('event','add_to_cart',{currency:'EUR', value: product.price*qty, items:[{item_id:String(product.id), item_name:product.name, price:product.price, quantity:qty}]})
      // Meta Pixel
      // @ts-ignore
      window.fbq && window.fbq('track','AddToCart',{content_ids:[String(product.id)], content_name:product.name, currency:'EUR', value: product.price*qty})
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
                  brand: 'Cioccolatini Michele',
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
                  <p className="price">€ {product.price.toFixed(2)}</p>
                  <p className="desc">{product.description}</p>

                  <div className="buy-row">
                    <input type="number" min={1} value={qty} onChange={e=>setQty(Math.max(1, parseInt(e.target.value||'1',10)))} className="qty" />
                    <button className="btn btn-primary" onClick={addToCart}>Aggiungi al carrello</button>
                  </div>

                  <div className="info-block">
                    <h3 className="poppins">Ingredienti</h3>
                    <p>Cacao, zucchero, burro di cacao, latte in polvere, nocciole, pistacchi, aroma naturale di limone.</p>
                  </div>
                  <div className="info-block">
                    <h3 className="poppins">Allergeni</h3>
                    <p>Può contenere tracce di latte, frutta a guscio e soia.</p>
                  </div>
                  <div className="info-block">
                    <h3 className="poppins">Valori nutrizionali (100g)</h3>
                    <ul className="nutri">
                      <li>Energia: 2300 kJ / 550 kcal</li>
                      <li>Grassi: 35 g (di cui saturi 21 g)</li>
                      <li>Carboidrati: 50 g (di cui zuccheri 45 g)</li>
                      <li>Proteine: 6 g</li>
                      <li>Sale: 0.2 g</li>
                    </ul>
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
        @media (max-width: 992px) { .product-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
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


