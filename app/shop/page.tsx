"use client"
export const dynamic = 'force-dynamic'

import { useMemo, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useCartWithToast } from "@/components/useCartWithToast"
import { ProductGridSkeleton } from "@/components/Skeleton"
import MobileFilters from "@/components/MobileFilters"
import Link from "next/link"
import Image from 'next/image'
import { useRouter } from "next/navigation"
import { useProducts } from "@/hooks/useSupabase"
import type { Product } from "@/lib/supabase"
import { Tag, Percent, Sparkles, TrendingUp, X } from 'lucide-react'

type PriceRange = 'all' | 'under5' | '5to10' | '10to20' | 'over20'

export default function ShopPage() {
  const router = useRouter()
  const { addItem } = useCartWithToast()
  const { products: prodotti, loading, error } = useProducts()
  const [pagina, setPagina] = useState(1)
  const [perPagina] = useState(12)
  const [ordine, setOrdine] = useState<"prezzo_asc" | "prezzo_desc" | "nome_asc">("prezzo_asc")
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Nuovi filtri avanzati
  const [chocolateType, setChocolateType] = useState<string>("tutti")
  const [collection, setCollection] = useState<string>("tutti")
  const [priceRange, setPriceRange] = useState<PriceRange>('all')
  const [boxFormat, setBoxFormat] = useState<string>("tutti")
  const [showOnlyNew, setShowOnlyNew] = useState(false)
  const [showOnlyBestseller, setShowOnlyBestseller] = useState(false)
  const [showOnlyDiscount, setShowOnlyDiscount] = useState(false)

  // Get unique values for filters
  const chocolateTypes = useMemo(() => {
    const types = [...new Set(prodotti.map(p => p.chocolate_type).filter(Boolean))]
    return ["tutti", ...types]
  }, [prodotti])

  const collections = useMemo(() => {
    const cols = [...new Set(prodotti.map(p => p.collection).filter(Boolean))]
    return ["tutti", ...cols]
  }, [prodotti])

  const boxFormats = useMemo(() => {
    const formats = [...new Set(prodotti.map(p => p.box_format).filter(Boolean))]
    return ["tutti", ...formats.sort((a, b) => Number(a) - Number(b))]
  }, [prodotti])

  const filtrati = useMemo(() => {
    let out = [...prodotti]
    
    // Filtro tipo di cioccolato
    if (chocolateType !== "tutti") out = out.filter(p => p.chocolate_type === chocolateType)
    
    // Filtro collezione
    if (collection !== "tutti") out = out.filter(p => p.collection === collection)
    
    // Filtro formato box
    if (boxFormat !== "tutti") out = out.filter(p => p.box_format?.toString() === boxFormat)
    
    // Filtro fascia di prezzo
    if (priceRange !== 'all') {
      switch(priceRange) {
        case 'under5':
          out = out.filter(p => p.price < 5)
          break
        case '5to10':
          out = out.filter(p => p.price >= 5 && p.price < 10)
          break
        case '10to20':
          out = out.filter(p => p.price >= 10 && p.price < 20)
          break
        case 'over20':
          out = out.filter(p => p.price >= 20)
          break
      }
    }
    
    // Filtro novità
    if (showOnlyNew) out = out.filter(p => p.is_new === true)
    
    // Filtro bestseller
    if (showOnlyBestseller) out = out.filter(p => p.is_bestseller === true)
    
    // Filtro sconti
    if (showOnlyDiscount) out = out.filter(p => (p.discount_percentage || 0) > 0)
    
    // Ordinamento
    if (ordine === "prezzo_asc") out.sort((a, b) => a.price - b.price)
    if (ordine === "prezzo_desc") out.sort((a, b) => b.price - a.price)
    if (ordine === "nome_asc") out.sort((a, b) => a.name.localeCompare(b.name))
    
    return out
  }, [prodotti, ordine, chocolateType, collection, priceRange, boxFormat, showOnlyNew, showOnlyBestseller, showOnlyDiscount])

  const totalePagine = Math.max(1, Math.ceil(filtrati.length / perPagina))
  const paginaSicura = Math.min(Math.max(1, pagina), totalePagine)
  const start = (paginaSicura - 1) * perPagina
  const visibili = filtrati.slice(start, start + perPagina)

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return chocolateType !== "tutti" || 
           collection !== "tutti" || 
           priceRange !== 'all' || 
           boxFormat !== "tutti" ||
           showOnlyNew || 
           showOnlyBestseller || 
           showOnlyDiscount
  }, [chocolateType, collection, priceRange, boxFormat, showOnlyNew, showOnlyBestseller, showOnlyDiscount])

  const onReset = () => {
    setOrdine("prezzo_asc")
    setChocolateType("tutti")
    setCollection("tutti")
    setPriceRange('all')
    setBoxFormat("tutti")
    setShowOnlyNew(false)
    setShowOnlyBestseller(false)
    setShowOnlyDiscount(false)
    setPagina(1)
  }

  // Count active filters for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (chocolateType !== "tutti") count++
    if (collection !== "tutti") count++
    if (priceRange !== 'all') count++
    if (boxFormat !== "tutti") count++
    if (showOnlyNew) count++
    if (showOnlyBestseller) count++
    if (showOnlyDiscount) count++
    return count
  }, [chocolateType, collection, priceRange, boxFormat, showOnlyNew, showOnlyBestseller, showOnlyDiscount])

  if (loading) {
    return (
      <main>
        <Header />
        <section className="shop-section">
          <div className="shop-container">
            <div className="loading-state">
              <ProductGridSkeleton count={12} />
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <Header />
        <section className="shop-section">
          <div className="shop-container">
            <div className="error-container">
              <h2>Errore nel caricamento</h2>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Riprova
              </button>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  // Filter content component
  const FilterContent = () => (
    <>
      {/* Filtri speciali con icone */}
      <div className="filter-section">
        <label className="filter-title">
          <Sparkles size={18} />
          Filtri Rapidi
        </label>
        <div className="special-filters">
          <button
            className={`special-chip ${showOnlyNew ? "active" : ""}`}
            onClick={() => { setShowOnlyNew(!showOnlyNew); setPagina(1) }}
          >
            <Tag size={16} />
            Novità
          </button>
          <button
            className={`special-chip ${showOnlyBestseller ? "active" : ""}`}
            onClick={() => { setShowOnlyBestseller(!showOnlyBestseller); setPagina(1) }}
          >
            <TrendingUp size={16} />
            Bestseller
          </button>
          <button
            className={`special-chip ${showOnlyDiscount ? "active" : ""}`}
            onClick={() => { setShowOnlyDiscount(!showOnlyDiscount); setPagina(1) }}
          >
            <Percent size={16} />
            In Sconto
          </button>
        </div>
      </div>

      {/* Tipo di Cioccolato */}
      <div className="filter-section">
        <label className="filter-title">
          <span className="filter-icon">🍫</span>
          Tipo di Cioccolato
        </label>
        <div className="filter-chips">
          {chocolateTypes.map((type) => (
            <button
              key={type}
              className={`chip ${chocolateType === type ? "active" : ""}`}
              onClick={() => { setChocolateType(type || "tutti"); setPagina(1) }}
            >
              {type === "tutti" ? "Tutti" : (type ? type.charAt(0).toUpperCase() + type.slice(1) : "")}
            </button>
          ))}
        </div>
      </div>

      {/* Collezione */}
      <div className="filter-section">
        <label className="filter-title">
          <span className="filter-icon">✨</span>
          Collezione
        </label>
        <div className="filter-chips">
          {collections.map((col) => (
            <button
              key={col}
              className={`chip ${collection === col ? "active" : ""}`}
              onClick={() => { setCollection(col || "tutti"); setPagina(1) }}
            >
              {col === "tutti" ? "Tutte" : col}
            </button>
          ))}
        </div>
      </div>

      {/* Fascia di Prezzo */}
      <div className="filter-section">
        <label className="filter-title">
          <span className="filter-icon">💰</span>
          Fascia di Prezzo
        </label>
        <div className="price-ranges">
          <button
            className={`price-chip ${priceRange === 'all' ? "active" : ""}`}
            onClick={() => { setPriceRange('all'); setPagina(1) }}
          >
            Tutti i prezzi
          </button>
          <button
            className={`price-chip ${priceRange === 'under5' ? "active" : ""}`}
            onClick={() => { setPriceRange('under5'); setPagina(1) }}
          >
            Sotto 5€
          </button>
          <button
            className={`price-chip ${priceRange === '5to10' ? "active" : ""}`}
            onClick={() => { setPriceRange('5to10'); setPagina(1) }}
          >
            5€ - 10€
          </button>
          <button
            className={`price-chip ${priceRange === '10to20' ? "active" : ""}`}
            onClick={() => { setPriceRange('10to20'); setPagina(1) }}
          >
            10€ - 20€
          </button>
          <button
            className={`price-chip ${priceRange === 'over20' ? "active" : ""}`}
            onClick={() => { setPriceRange('over20'); setPagina(1) }}
          >
            Oltre 20€
          </button>
        </div>
      </div>

      {/* Formato Box */}
      <div className="filter-section">
        <label className="filter-title">
          <span className="filter-icon">📦</span>
          Formato Box
        </label>
        <div className="filter-chips">
          {boxFormats.map((format) => (
            <button
              key={format}
              className={`chip ${boxFormat === format?.toString() ? "active" : ""}`}
              onClick={() => { setBoxFormat(format?.toString() || "tutti"); setPagina(1) }}
            >
              {format === "tutti" ? "Tutti" : `${format} praline`}
            </button>
          ))}
        </div>
      </div>

      {/* Ordinamento */}
      <div className="filter-section">
        <label className="filter-title">
          <span className="filter-icon">⚡</span>
          Ordina per
        </label>
        <select
          className="sort-select"
          value={ordine}
          onChange={(e) => { setOrdine(e.target.value as any); setPagina(1) }}
        >
          <option value="prezzo_asc">Prezzo: crescente</option>
          <option value="prezzo_desc">Prezzo: decrescente</option>
          <option value="nome_asc">Nome: A-Z</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button className="btn btn-reset" onClick={onReset}>
          <X size={18} />
          Reset filtri
        </button>
      )}
    </>
  )

  // Calculate discounted price
  const getDiscountedPrice = (price: number, discount: number | null | undefined) => {
    if (!discount || discount <= 0) return null
    return price * (1 - discount / 100)
  }

  return (
    <main>
      <Header />
      <section className="shop-section">
        <div className="shop-container">
          {/* Breadcrumb JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/' },
                  { '@type': 'ListItem', position: 2, name: 'Shop', item: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/shop' }
                ]
              })
            }}
          />
          
          {/* Mobile Filters */}
          <MobileFilters
            resultsCount={filtrati.length}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
            onReset={onReset}
            hasActiveFilters={hasActiveFilters}
          >
            <FilterContent />
          </MobileFilters>

          {/* Product List with Filters */}
          <section className="shop-list-full">
            {/* Header with Title */}
            <div className="page-header">
              <h1 className="poppins">I Nostri Prodotti</h1>
              <p className="results-count">
                {filtrati.length} {filtrati.length === 1 ? 'prodotto trovato' : 'prodotti trovati'}
              </p>
            </div>

            {/* Horizontal Filters Bar - Desktop Only */}
            <div className="horizontal-filters desktop-only">
              <div className="filters-row">
                {/* Filtri Rapidi */}
                <div className="filter-group-horizontal special-group">
                  <button
                    className={`filter-btn special ${showOnlyNew ? "active" : ""}`}
                    onClick={() => { setShowOnlyNew(!showOnlyNew); setPagina(1) }}
                  >
                    <Tag size={16} />
                    Novità
                  </button>
                  <button
                    className={`filter-btn special ${showOnlyBestseller ? "active" : ""}`}
                    onClick={() => { setShowOnlyBestseller(!showOnlyBestseller); setPagina(1) }}
                  >
                    <TrendingUp size={16} />
                    Bestseller
                  </button>
                  <button
                    className={`filter-btn special ${showOnlyDiscount ? "active" : ""}`}
                    onClick={() => { setShowOnlyDiscount(!showOnlyDiscount); setPagina(1) }}
                  >
                    <Percent size={16} />
                    In Sconto
                  </button>
                    </div>

                {/* Tipo Cioccolato */}
                <select
                  className="filter-select-compact"
                  value={chocolateType}
                  onChange={(e) => { setChocolateType(e.target.value); setPagina(1) }}
                  title="Tipo di cioccolato"
                >
                  <option value="tutti">🍫 Tutti</option>
                  {chocolateTypes.filter(t => t !== "tutti").map((type) => (
                    <option key={type} value={type || "tutti"}>
                      🍫 {type ? type.charAt(0).toUpperCase() + type.slice(1) : ""}
                    </option>
                  ))}
                </select>

                {/* Collezione */}
                <select
                  className="filter-select-compact"
                  value={collection}
                  onChange={(e) => { setCollection(e.target.value); setPagina(1) }}
                  title="Collezione"
                >
                  <option value="tutti">✨ Tutte</option>
                  {collections.filter(c => c !== "tutti").map((col) => (
                    <option key={col} value={col || "tutti"}>
                      ✨ {col}
                    </option>
                  ))}
                </select>

                {/* Prezzo */}
                <select
                  className="filter-select-compact"
                  value={priceRange}
                  onChange={(e) => { setPriceRange(e.target.value as PriceRange); setPagina(1) }}
                  title="Fascia di prezzo"
                >
                  <option value="all">💰 Prezzo</option>
                  <option value="under5">{"< 5€"}</option>
                  <option value="5to10">5€ - 10€</option>
                  <option value="10to20">10€ - 20€</option>
                  <option value="over20">{"> 20€"}</option>
                </select>

                {/* Formato */}
                <select
                  className="filter-select-compact"
                  value={boxFormat}
                  onChange={(e) => { setBoxFormat(e.target.value); setPagina(1) }}
                  title="Formato box"
                >
                  <option value="tutti">📦 Formato</option>
                  {boxFormats.filter(f => f !== "tutti").map((format) => (
                    <option key={format} value={format?.toString() || "tutti"}>
                      📦 {format} pz
                    </option>
                  ))}
                </select>

                {/* Ordinamento */}
                <select
                  className="filter-select-compact"
                  value={ordine}
                  onChange={(e) => { setOrdine(e.target.value as any); setPagina(1) }}
                  title="Ordinamento"
                >
                  <option value="prezzo_asc">⚡ Prezzo ↑</option>
                  <option value="prezzo_desc">⚡ Prezzo ↓</option>
                  <option value="nome_asc">⚡ A-Z</option>
                </select>

                {/* Reset */}
                {hasActiveFilters && (
                  <button className="reset-btn-horizontal" onClick={onReset} title="Reset filtri">
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Active Filters Count */}
              {activeFiltersCount > 0 && (
                <div className="active-filters-info">
                  {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro attivo' : 'filtri attivi'}
                </div>
              )}
            </div>

            <div className="grid">
              {visibili.map((p) => {
                const discountedPrice = getDiscountedPrice(p.price, p.discount_percentage)
                return (
                <Link href={`/product/${p.id}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <article className="product-card">
                      {/* Badges */}
                      <div className="product-badges">
                        {p.is_new && (
                          <span className="badge badge-new">
                            <Tag size={12} />
                            Novità
                        </span>
                        )}
                        {p.is_bestseller && (
                          <span className="badge badge-bestseller">
                            <TrendingUp size={12} />
                            Bestseller
                          </span>
                        )}
                        {p.discount_percentage && p.discount_percentage > 0 && (
                          <span className="badge badge-discount">
                            <Percent size={12} />
                            -{p.discount_percentage}%
                          </span>
                        )}
                      </div>

                      {/* Image */}
                      <div className="product-image">
                        <Image 
                          src={p.image_url} 
                          alt={p.name} 
                          fill 
                          sizes="(max-width: 600px) 100vw, (max-width: 992px) 50vw, 33vw" 
                          style={{ objectFit: 'cover' }} 
                        />
                      </div>

                      {/* Content */}
                      <div className="product-content">
                        <h3 className="product-name poppins">{p.name}</h3>
                        <p className="product-description">{p.description}</p>
                        
                        {/* Meta Info */}
                        <div className="product-meta">
                          {p.collection && (
                            <span className="meta-badge">{p.collection}</span>
                          )}
                          {p.chocolate_type && (
                            <span className="meta-badge">{p.chocolate_type}</span>
                          )}
                          {p.box_format && (
                            <span className="meta-badge">{p.box_format} pz</span>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="product-footer">
                          <div className="price-wrapper">
                            {discountedPrice ? (
                              <>
                                <span className="price-original">€ {p.price.toFixed(2)}</span>
                                <span className="price-discounted">€ {discountedPrice.toFixed(2)}</span>
                              </>
                            ) : (
                        <span className="price">€ {p.price.toFixed(2)}</span>
                            )}
                          </div>
                        <button 
                            className="btn btn-add" 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              e.stopPropagation(); 
                              addItem({ 
                                id: p.id, 
                                nome: p.name, 
                                prezzo: discountedPrice || p.price, 
                                immagine: p.image_url, 
                                tipo: p.category, 
                                pezzi: 1 
                              }); 
                            }}
                          disabled={p.stock_quantity === 0}
                        >
                            {p.stock_quantity > 0 ? 'Aggiungi' : 'Esaurito'}
                        </button>
                      </div>
                    </div>
                  </article>
                </Link>
                )
              })}
            </div>

            {visibili.length === 0 && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>Nessun prodotto trovato</h3>
                <p>Prova a modificare i filtri per vedere più prodotti</p>
                <button className="btn btn-primary" onClick={onReset}>
                  Mostra tutti i prodotti
                </button>
              </div>
            )}

            {totalePagine > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  disabled={paginaSicura === 1} 
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  ← Precedente
                </button>
                <span className="page-info">
                  Pagina <strong>{paginaSicura}</strong> di <strong>{totalePagine}</strong>
                </span>
                <button 
                  className="pagination-btn"
                  disabled={paginaSicura === totalePagine} 
                  onClick={() => setPagina((p) => Math.min(totalePagine, p + 1))}
                >
                  Successiva →
                </button>
              </div>
            )}
          </section>
        </div>
      </section>
      <Footer />

      <style jsx global>{`
        .shop-section { 
          position: relative; 
          z-index: 10; 
          padding: 13rem 2rem 3rem;
          background: var(--color-cream);
          min-height: 100vh;
        }
        
        .shop-container { 
          max-width: 1400px; 
          width: 100%;
          margin: 0 auto; 
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        /* ========== PAGE HEADER ========== */
        .page-header {
          text-align: center;
          margin-bottom: 1.5rem; 
        }
        
        .page-header h1 {
          font-size: 2.5rem;
          color: var(--color-navy);
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }
        
        .results-count {
          color: #666;
          font-size: 1rem;
          margin: 0;
        }
        
        /* ========== HORIZONTAL FILTERS ========== */
        .horizontal-filters {
          background: white;
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: 0 4px 20px rgba(0,0,0,.06);
          margin-bottom: 2rem;
        }
        
        .filters-row {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }
        
        .filter-select-compact {
          padding: 0.5rem 1.75rem 0.5rem 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600; 
          cursor: pointer;
          background: white;
          transition: all 0.2s ease;
          flex-shrink: 1;
          min-width: 110px;
          max-width: 180px;
        }
        
        .filter-select-compact:hover {
          border-color: var(--color-brown);
        }
        
        .filter-select-compact:focus {
          outline: none;
          border-color: var(--color-brown);
          box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
        }
        
        /* Special Filters Group */
        .special-group {
          display: flex; 
          gap: 0.5rem;
          padding-right: 0.75rem;
          margin-right: 0.25rem;
          border-right: 2px solid #e9ecef;
          flex-shrink: 0;
        }
        
        .filter-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.5rem 0.875rem;
          border-radius: 10px;
          border: 2px solid #e9ecef; 
          background: white;
          cursor: pointer; 
          font-weight: 600; 
          font-size: 0.8rem;
          transition: all 0.2s ease;
          color: #495057;
          white-space: nowrap;
        }
        
        .filter-btn:hover {
          border-color: var(--color-brown);
          transform: translateY(-2px);
        }
        
        .filter-btn.active {
          background: var(--color-brown); 
          color: white;
          border-color: var(--color-brown); 
        }
        
        .filter-btn.special.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
        }
        
        .reset-btn-horizontal {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 0.625rem;
          border-radius: 10px;
          border: 2px solid #dc3545;
          background: white;
          color: #dc3545;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin-left: 0.25rem;
        }
        
        .reset-btn-horizontal:hover {
          background: #dc3545;
          color: white;
          transform: translateY(-2px);
        }
        
        .active-filters-info {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e9ecef;
          font-size: 0.8rem;
          color: var(--color-brown);
          font-weight: 600;
          text-align: center;
        }
        
        .desktop-only {
          display: block;
        }
        
        .filter-section { 
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .filter-section:last-of-type {
          border-bottom: none;
        }
        
        .filter-title { 
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700; 
          margin-bottom: 1rem; 
          color: var(--color-navy);
          font-size: 1rem;
        }
        
        .filter-icon {
          font-size: 1.1rem;
        }
        
        /* Search Input */
        .search-input { 
          width: 100%; 
          padding: 0.875rem 1rem; 
          border: 2px solid #e9ecef; 
          border-radius: 12px; 
          font-family: Inter, sans-serif;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--color-brown);
          box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
        }
        
        /* Special Filters */
        .special-filters {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .special-chip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 2px solid #e9ecef;
          background: white;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          color: #495057;
        }
        
        .special-chip:hover {
          border-color: var(--color-brown);
          transform: translateY(-2px);
        }
        
        .special-chip.active {
          background: var(--color-brown);
          color: white;
          border-color: var(--color-brown);
        }
        
        /* Filter Chips */
        .filter-chips { 
          display: flex;
          flex-wrap: wrap; 
          gap: 0.5rem;
        }
        
        .chip { 
          padding: 0.625rem 1rem; 
          border-radius: 999px; 
          border: 2px solid #e9ecef; 
          background: white; 
          cursor: pointer;
          font-weight: 600; 
          font-size: 0.85rem; 
          transition: all 0.2s ease;
          color: #495057;
        }
        
        .chip:hover {
          border-color: var(--color-brown);
          transform: translateY(-1px);
        }
        
        .chip.active { 
          background: var(--color-brown); 
          color: white; 
          border-color: var(--color-brown);
        }
        
        /* Price Ranges */
        .price-ranges {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .price-chip {
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 2px solid #e9ecef;
          background: white;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          text-align: left;
          color: #495057;
        }
        
        .price-chip:hover {
          border-color: var(--color-brown);
          transform: translateX(3px);
        }
        
        .price-chip.active {
          background: var(--color-brown);
          color: white;
          border-color: var(--color-brown);
        }
        
        /* Sort Select */
        .sort-select {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-family: Inter, sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }
        
        .sort-select:focus {
          outline: none;
          border-color: var(--color-brown);
          box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
        }
        
        /* Reset Button */
        .btn-reset {
          width: 100%;
          padding: 0.875rem 1rem;
          background: #fff;
          border: 2px solid #dc3545;
          color: #dc3545;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .btn-reset:hover {
          background: #dc3545;
          color: white;
          transform: translateY(-2px);
        }

        /* ========== PRODUCT GRID ========== */
        .shop-list-full {
          width: 100%;
        }
        .grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
          gap: 2rem; 
          margin-bottom: 3rem;
        }
        
        .product-card { 
          background: white; 
          border-radius: 20px; 
          overflow: hidden; 
          box-shadow: 0 4px 20px rgba(0,0,0,.06); 
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0,0,0,.12);
        }
        
        /* Product Badges */
        .product-badges {
          position: absolute;
          top: 1rem;
          left: 1rem;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .badge-new {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .badge-bestseller {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }
        
        .badge-discount {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: #8b4513;
        }
        
        /* Product Image */
        .product-image { 
          position: relative; 
          width: 100%; 
          height: 280px;
          background: #f8f9fa;
        }
        
        /* Product Content */
        .product-content { 
          padding: 1.5rem; 
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          flex: 1;
        }
        
        .product-name { 
          font-size: 1.2rem; 
          color: var(--color-navy);
          line-height: 1.3;
          margin: 0;
        }
        
        .product-description { 
          color: #666; 
          font-size: 0.9rem; 
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Product Meta */
        .product-meta { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 0.5rem; 
        }
        
        .meta-badge { 
          background: var(--color-cream); 
          border: 1px solid var(--color-brown); 
          border-radius: 6px; 
          padding: 0.25rem 0.625rem; 
          font-size: 0.75rem; 
          font-weight: 600;
          color: var(--color-brown);
        }
        
        /* Product Footer */
        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #f0f0f0;
        }
        
        .price-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .price { 
          font-weight: 700; 
          color: var(--color-brown); 
          font-size: 1.4rem;
        }
        
        .price-original {
          font-size: 0.9rem;
          color: #999;
          text-decoration: line-through;
        }
        
        .price-discounted {
          font-size: 1.4rem;
          font-weight: 700;
          color: #dc3545;
        }
        
        .btn-add { 
          padding: 0.75rem 1.25rem; 
          font-size: 0.9rem;
          font-weight: 700;
          background: var(--color-brown);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-add:hover:not(:disabled) {
          background: #6d3d0f;
          transform: translateY(-2px);
        }
        
        .btn-add:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        /* ========== NO RESULTS ========== */
        .no-results {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,.06);
        }
        
        .no-results-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .no-results h3 {
          font-size: 1.5rem;
          color: var(--color-navy);
          margin: 0 0 0.5rem 0;
        }
        
        .no-results p {
          color: #666;
          margin: 0 0 2rem 0;
        }

        /* ========== PAGINATION ========== */
        .pagination { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 2rem; 
          padding: 2rem 0;
        }
        
        .pagination-btn { 
          padding: 0.875rem 1.5rem; 
          border: 2px solid #e9ecef; 
          border-radius: 12px; 
          background: white; 
          cursor: pointer; 
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        
        .pagination-btn:hover:not(:disabled) {
          border-color: var(--color-brown);
          background: var(--color-brown);
          color: white;
          transform: translateY(-2px);
        }
        
        .pagination-btn:disabled { 
          opacity: .4; 
          cursor: not-allowed; 
        }
        
        .page-info { 
          color: #666; 
          font-weight: 500;
        }

        .page-info strong {
          color: var(--color-brown);
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1200px) {
          .filters-row {
            gap: 0.5rem;
          }
          
          .filter-select-compact {
            min-width: 100px;
            font-size: 0.8rem;
            padding: 0.5rem 1.5rem 0.5rem 0.65rem;
          }
          
          .filter-btn {
            font-size: 0.75rem;
            padding: 0.5rem 0.75rem;
            gap: 0.25rem;
          }
          
          .special-group {
            padding-right: 0.5rem;
            margin-right: 0.25rem;
          }
        }
        
        @media (max-width: 992px) { 
          .shop-section {
            padding: 10rem 1.5rem 2rem;
          }
          
          .desktop-only {
            display: none !important;
          }
          
          .page-header h1 {
            font-size: 2rem;
        }
        
          .grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }
        
        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 1.8rem;
          }
          
          .grid {
            grid-template-columns: 1fr;
          }
          
          .product-card {
            max-width: 500px;
            margin: 0 auto;
          }
        }
        
        @media (max-width: 480px) {
          .shop-section {
            padding: 8rem 1rem 2rem;
          }
          
          .pagination {
            flex-direction: column;
            gap: 1rem;
          }
          
          .pagination-btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  )
}