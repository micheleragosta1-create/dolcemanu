"use client"

import { useMemo, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useCartWithToast } from "@/components/useCartWithToast"
import { ProductGridSkeleton } from "@/components/Skeleton"
import MobileFilters from "@/components/MobileFilters"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProducts } from "@/hooks/useSupabase"
import type { Product } from "@/lib/supabase"

export default function ShopPage() {
  const router = useRouter()
  const { addItem } = useCartWithToast()
  const { products: prodotti, loading, error } = useProducts()
  const [pagina, setPagina] = useState(1)
  const [perPagina] = useState(8)
  const [categoria, setCategoria] = useState<string>("tutti")
  const [ordine, setOrdine] = useState<"prezzo_asc" | "prezzo_desc" | "nome_asc">("prezzo_asc")
  const [query, setQuery] = useState("")
  const [prezzoMin, setPrezzoMin] = useState<number>(0)
  const [prezzoMax, setPrezzoMax] = useState<number>(1000)
  const [soloDisponibili, setSoloDisponibili] = useState<boolean>(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Get unique categories
  const categorie = useMemo(() => {
    const cats = [...new Set(prodotti.map(p => p.category))]
    return ["tutti", ...cats]
  }, [prodotti])

  const filtrati = useMemo(() => {
    const q = query.trim().toLowerCase()
    let out = [...prodotti]
    
    // Filtro testo
    if (q) out = out.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    
    // Filtro categoria
    if (categoria !== "tutti") out = out.filter(p => p.category === categoria)
    
    // Filtro prezzo
    out = out.filter(p => p.price >= prezzoMin && p.price <= prezzoMax)
    
    // Filtro disponibilità
    if (soloDisponibili) out = out.filter(p => p.stock_quantity > 0)
    
    // Ordinamento
    if (ordine === "prezzo_asc") out.sort((a, b) => a.price - b.price)
    if (ordine === "prezzo_desc") out.sort((a, b) => b.price - a.price)
    if (ordine === "nome_asc") out.sort((a, b) => a.name.localeCompare(b.name))
    
    return out
  }, [prodotti, query, categoria, ordine, prezzoMin, prezzoMax, soloDisponibili])

  const totalePagine = Math.max(1, Math.ceil(filtrati.length / perPagina))
  const paginaSicura = Math.min(Math.max(1, pagina), totalePagine)
  const start = (paginaSicura - 1) * perPagina
  const visibili = filtrati.slice(start, start + perPagina)

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return query !== "" || categoria !== "tutti" || prezzoMin !== 0 || prezzoMax !== 1000 || soloDisponibili || ordine !== "prezzo_asc"
  }, [query, categoria, prezzoMin, prezzoMax, soloDisponibili, ordine])

  const onReset = () => {
    setQuery("")
    setCategoria("tutti")
    setOrdine("prezzo_asc")
    setPrezzoMin(0)
    setPrezzoMax(1000)
    setSoloDisponibili(false)
    setPagina(1)
  }

  if (loading) {
    return (
      <main>
        <Header />
        <section className="shop-section">
          <div className="shop-container">
            <div className="loading-state">
              <ProductGridSkeleton count={8} />
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
      <div className="filter-group">
        <label className="filter-label" htmlFor="search">Cerca prodotti</label>
        <input
          id="search"
          className="search"
          type="text"
          placeholder="Cerca per nome o descrizione..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPagina(1) }}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Categoria</label>
        <div className="filter-chips">
          {categorie.map((cat) => (
            <button
              key={cat}
              className={`chip ${categoria === cat ? "active" : ""}`}
              onClick={() => { setCategoria(cat); setPagina(1) }}
            >
              {cat === "tutti" ? "Tutte" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Fascia di prezzo</label>
        <div className="price-range">
          <input
            type="number"
            className="price-input"
            placeholder="Min"
            value={prezzoMin}
            onChange={(e) => { setPrezzoMin(Math.max(0, Number(e.target.value) || 0)); setPagina(1) }}
          />
          <span>-</span>
          <input
            type="number"
            className="price-input"
            placeholder="Max"
            value={prezzoMax}
            onChange={(e) => { setPrezzoMax(Math.max(0, Number(e.target.value) || 1000)); setPagina(1) }}
          />
          <span>€</span>
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={soloDisponibili}
            onChange={(e) => { setSoloDisponibili(e.target.checked); setPagina(1) }}
          />
          Solo prodotti disponibili
        </label>
      </div>

      <div className="filter-group">
        <label className="filter-label">Ordina per</label>
        <select
          className="select"
          value={ordine}
          onChange={(e) => { setOrdine(e.target.value as any); setPagina(1) }}
        >
          <option value="prezzo_asc">Prezzo: crescente</option>
          <option value="prezzo_desc">Prezzo: decrescente</option>
          <option value="nome_asc">Nome: A-Z</option>
        </select>
      </div>

      <button className="btn btn-secondary desktop-reset-btn" onClick={onReset}>Reset filtri</button>
    </>
  )

  return (
    <main>
      <Header />
      <section className="shop-section">
        <div className="shop-container">
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

          <aside className="shop-filters desktop-filters">
            <h2 className="poppins">Filtri</h2>
            <FilterContent />
          </aside>

          <section className="shop-list">
            <div className="results-header">
              <h1 className="poppins">I Nostri Prodotti</h1>
              <p className="results-count">{filtrati.length} prodotti trovati</p>
            </div>

            <div className="grid">
              {visibili.map((p) => (
                <Link href={`/product/${p.id}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <article
                    className="card"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="thumb" style={{ backgroundImage: `url(${p.image_url})` }} />
                    <div className="body">
                      <h3 className="poppins name">{p.name}</h3>
                      <p className="desc">{p.description}</p>
                      <div className="meta">
                        <span className="badge">{p.category}</span>
                        <span className="stock">
                          {p.stock_quantity > 0 ? 
                            `${p.stock_quantity} disponibili` : 
                            'Esaurito'
                          }
                        </span>
                      </div>
                      <div className="card-footer">
                        <span className="price">€ {p.price.toFixed(2)}</span>
                        <button 
                          className="btn btn-primary small" 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem({ id: p.id, nome: p.name, prezzo: p.price, immagine: p.image_url, tipo: p.category, pezzi: 1 }); }}
                          disabled={p.stock_quantity === 0}
                        >
                          {p.stock_quantity > 0 ? 'Aggiungi al carrello' : 'Esaurito'}
                        </button>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {visibili.length === 0 && (
              <div className="no-results">
                <p>Nessun prodotto trovato con i filtri selezionati.</p>
                <button className="btn btn-primary" onClick={onReset}>
                  Mostra tutti i prodotti
                </button>
              </div>
            )}

            {totalePagine > 1 && (
              <div className="pagination">
                <button disabled={paginaSicura === 1} onClick={() => setPagina((p) => Math.max(1, p - 1))}>
                  ← Precedente
                </button>
                <span className="page-info">Pagina {paginaSicura} di {totalePagine}</span>
                <button disabled={paginaSicura === totalePagine} onClick={() => setPagina((p) => Math.min(totalePagine, p + 1))}>
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
          padding: 7rem 2rem 3rem; 
          background: var(--color-cream);
        }
        .shop-container { 
          max-width: 1200px; 
          margin: 0 auto; 
          display: grid; 
          grid-template-columns: 280px 1fr; 
          gap: 3rem; 
        }
        
        /* Filters Sidebar */
        .shop-filters { 
          background: #fff; 
          border: 1px solid rgba(0,0,0,.06); 
          border-radius: 16px; 
          padding: 1.5rem; 
          height: fit-content; 
          box-shadow: 0 10px 30px rgba(0,0,0,.08); 
        }
        .shop-filters h2 { 
          font-size: 1.4rem; 
          margin-bottom: 1.5rem; 
          color: var(--color-navy);
        }
        .filter-group { margin-bottom: 1.5rem; }
        .filter-label { 
          display: block; 
          font-weight: 600; 
          margin-bottom: .7rem; 
          color: var(--color-navy);
          font-size: 0.95rem;
        }
        .filter-chips { 
          display: flex; 
          flex-wrap: wrap; 
          gap: .6rem; 
        }
        .chip { 
          padding: .6rem 1rem; 
          border-radius: 999px; 
          border: 2px solid #e9ecef; 
          background: #fff; 
          cursor: pointer; 
          font-weight: 600; 
          font-size: .85rem; 
          transition: all 0.3s ease;
        }
        .chip:hover {
          border-color: var(--color-brown);
        }
        .chip.active { 
          background: var(--color-brown); 
          color: #fff; 
          border-color: var(--color-brown); 
        }
        .select, .search { 
          width: 100%; 
          padding: .8rem 1rem; 
          border: 2px solid #e9ecef; 
          border-radius: 10px; 
          font-family: Inter, sans-serif;
          font-size: 0.95rem;
          transition: border-color 0.3s ease;
        }
        .select:focus, .search:focus {
          outline: none;
          border-color: var(--color-brown);
        }
        
        /* Price Range Styles */
        .price-range {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .price-input {
          width: 80px;
          padding: 0.5rem 0.7rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.9rem;
          text-align: center;
          transition: border-color 0.3s ease;
        }
        .price-input:focus {
          outline: none;
          border-color: var(--color-brown);
        }
        .price-range span {
          color: #666;
          font-weight: 500;
        }
        
        /* Checkbox Styles */
        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.95rem;
        }
        .filter-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--color-brown);
          cursor: pointer;
        }

        /* Loading & Error States */
        .loading-container, .error-container, .no-results {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,.08);
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid var(--color-brown);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Results Header */
        .results-header {
          margin-bottom: 2rem;
        }
        .results-header h1 {
          font-size: 2.2rem;
          color: var(--color-navy);
          margin-bottom: 0.5rem;
        }
        .results-count {
          color: #666;
          font-size: 1rem;
        }

        /* Product Grid */
        .shop-list .grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
          gap: 1.5rem; 
          margin-bottom: 2rem;
        }
        .card { 
          background: #fff; 
          border: 1px solid rgba(0,0,0,.06); 
          border-radius: 16px; 
          overflow: hidden; 
          box-shadow: 0 10px 30px rgba(0,0,0,.08); 
          display: grid; 
          grid-template-rows: 200px auto; 
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,.12);
        }
        .thumb { 
          background-size: cover; 
          background-position: center; 
          position: relative;
        }
        .body { 
          padding: 1.25rem; 
          display: grid; 
          gap: .8rem; 
        }
        .name { 
          font-size: 1.15rem; 
          color: var(--color-navy);
          line-height: 1.3;
        }
        .desc { 
          color: #666; 
          font-size: .95rem; 
          line-height: 1.5;
        }
        .meta { 
          display: flex; 
          flex-wrap: wrap; 
          gap: .6rem; 
          align-items: center; 
        }
        .badge { 
          background: var(--color-cream); 
          border: 1px solid var(--color-brown); 
          border-radius: 999px; 
          padding: .3rem .8rem; 
          font-size: .8rem; 
          font-weight: 600;
          color: var(--color-brown);
        }
        .stock {
          font-size: 0.85rem;
          color: #666;
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        .price { 
          font-weight: 700; 
          color: var(--color-brown); 
          font-size: 1.2rem;
        }
        .small { 
          padding: .6rem 1rem; 
          font-size: .85rem; 
        }

        /* Pagination */
        .pagination { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 1.5rem; 
          padding: 2rem 0;
        }
        .pagination button { 
          padding: .8rem 1.2rem; 
          border: 2px solid #e9ecef; 
          border-radius: 8px; 
          background: #fff; 
          cursor: pointer; 
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .pagination button:hover:not(:disabled) {
          border-color: var(--color-brown);
          background: var(--color-brown);
          color: white;
        }
        .pagination button:disabled { 
          opacity: .5; 
          cursor: not-allowed; 
        }
        .page-info { 
          color: #666; 
          font-weight: 500;
        }

        .desktop-reset-btn {
          display: block;
        }

        /* Responsive */
        @media (max-width: 992px) { 
          .shop-container { 
            grid-template-columns: 1fr; 
            gap: 1rem;
          }
          
          .desktop-filters {
            display: none;
          }
          
          .shop-list {
            order: 1;
          }
        }
        
        @media (min-width: 993px) {
          .desktop-reset-btn {
            display: block;
          }
        }
        
        @media (max-width: 768px) {
          .shop-section {
            padding: 6rem 1rem 2rem;
          }
          .shop-list .grid {
            grid-template-columns: 1fr;
          }
          .results-header h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </main>
  )
}