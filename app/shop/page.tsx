"use client"

import { useMemo, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useCart } from "@/components/CartContext"

type TipoCioccolato = "bianco" | "latte" | "fondente"

type Prodotto = {
  id: number
  nome: string
  descrizione: string
  prezzo: number
  immagine: string
  tipo: TipoCioccolato
  pezzi: 6 | 12 | 24
}

const ALL_PRODOTTI: Prodotto[] = Array.from({ length: 54 }).map((_, i) => {
  const tipi: TipoCioccolato[] = ["bianco", "latte", "fondente"]
  const pezziArr: (6 | 12 | 24)[] = [6, 12, 24]
  const tipo = tipi[i % 3]
  const pezzi = pezziArr[i % 3]
  return {
    id: i + 1,
    nome: `Box Praline ${i + 1}`,
    descrizione: "Praline artigianali con ingredienti selezionati.",
    prezzo: 14.9 + (i % 6) * 5,
    immagine: `/images/prodotto-${(i % 3) + 1}.svg`,
    tipo,
    pezzi,
  }
})

export default function ShopPage() {
  const { addItem } = useCart()
  const [pagina, setPagina] = useState(1)
  const [perPagina] = useState(10)
  const [tipo, setTipo] = useState<TipoCioccolato | "tutti">("tutti")
  const [pezzi, setPezzi] = useState<6 | 12 | 24 | "tutti">("tutti")
  const [ordine, setOrdine] = useState<"prezzo_asc" | "prezzo_desc" | "nome_asc">("prezzo_asc")
  const [query, setQuery] = useState("")

  const filtrati = useMemo(() => {
    const q = query.trim().toLowerCase()
    let out = [...ALL_PRODOTTI]
    if (q) out = out.filter(p => p.nome.toLowerCase().includes(q) || p.descrizione.toLowerCase().includes(q))
    if (tipo !== "tutti") out = out.filter(p => p.tipo === tipo)
    if (pezzi !== "tutti") out = out.filter(p => p.pezzi === pezzi)
    if (ordine === "prezzo_asc") out.sort((a, b) => a.prezzo - b.prezzo)
    if (ordine === "prezzo_desc") out.sort((a, b) => b.prezzo - a.prezzo)
    if (ordine === "nome_asc") out.sort((a, b) => a.nome.localeCompare(b.nome))
    return out
  }, [query, tipo, pezzi, ordine])

  const totalePagine = Math.max(1, Math.ceil(filtrati.length / perPagina))
  const paginaSicura = Math.min(Math.max(1, pagina), totalePagine)
  const start = (paginaSicura - 1) * perPagina
  const visibili = filtrati.slice(start, start + perPagina)

  const onReset = () => {
    setQuery("")
    setTipo("tutti")
    setPezzi("tutti")
    setOrdine("prezzo_asc")
    setPagina(1)
  }

  return (
    <main>
      <Header />
      <section className="shop-section">
        <div className="shop-container">
          <aside className="shop-filters">
            <h2 className="poppins">Filtri</h2>

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
              <label className="filter-label">Tipologia</label>
              <div className="filter-chips">
                {["tutti", "bianco", "latte", "fondente"].map((t) => (
                  <button
                    key={t}
                    className={`chip ${tipo === t ? "active" : ""}`}
                    onClick={() => { setTipo(t as any); setPagina(1) }}
                  >
                    {t === "tutti" ? "Tutti" : `Cioccolato ${t}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Num. praline</label>
              <div className="filter-chips">
                {["tutti", 6, 12, 24].map((n) => (
                  <button
                    key={String(n)}
                    className={`chip ${pezzi === n ? "active" : ""}`}
                    onClick={() => { setPezzi(n as any); setPagina(1) }}
                  >
                    {n === "tutti" ? "Tutte" : `${n}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Ordina</label>
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

            <button className="btn btn-secondary" onClick={onReset}>Reset filtri</button>
          </aside>

          <section className="shop-list">
            <div className="grid">
              {visibili.map((p) => (
                <article key={p.id} className="card">
                  <div className="thumb" style={{ backgroundImage: `url(${p.immagine})` }} />
                  <div className="body">
                    <h3 className="poppins name">{p.nome}</h3>
                    <p className="desc">{p.descrizione}</p>
                    <div className="meta">
                      <span className="badge">{`Cioccolato ${p.tipo}`}</span>
                      <span className="badge">{`${p.pezzi} praline`}</span>
                      <span className="price">€ {p.prezzo.toFixed(2)}</span>
                    </div>
                    <button className="btn btn-primary small" onClick={() => addItem({ id: p.id, nome: p.nome, prezzo: p.prezzo, immagine: p.immagine, tipo: p.tipo, pezzi: p.pezzi })}>Aggiungi al carrello</button>
                  </div>
                </article>
              ))}
            </div>

            <div className="pagination">
              <button disabled={paginaSicura === 1} onClick={() => setPagina((p) => Math.max(1, p - 1))}>
                ← Indietro
              </button>
              <span className="page-info">Pagina {paginaSicura} di {totalePagine} • {filtrati.length} risultati</span>
              <button disabled={paginaSicura === totalePagine} onClick={() => setPagina((p) => Math.min(totalePagine, p + 1))}>
                Avanti →
              </button>
            </div>
          </section>
        </div>
      </section>
      <Footer />

      <style jsx global>{`
        .shop-section { position: relative; z-index: 10; padding: 7rem 2rem 3rem; }
        .shop-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }
        .shop-filters { background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 16px; padding: 1.25rem; height: fit-content; box-shadow: 0 10px 30px rgba(0,0,0,.06); }
        .shop-filters h2 { font-size: 1.3rem; margin-bottom: 1rem; }
        .filter-group { margin-bottom: 1rem; }
        .filter-label { display: block; font-weight: 600; margin-bottom: .5rem; }
        .filter-chips { display: flex; flex-wrap: wrap; gap: .5rem; }
        .chip { padding: .4rem .8rem; border-radius: 999px; border: 2px solid #e9ecef; background: #fff; cursor: pointer; font-weight: 600; font-size: .85rem; }
        .chip.active { background: #ff6b6b; color: #fff; border-color: #ff6b6b; }
        .select, .search { width: 100%; padding: .6rem .8rem; border: 2px solid #e9ecef; border-radius: 10px; font-family: Inter, sans-serif; }

        .shop-list .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
        .card { background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.06); display: grid; grid-template-rows: 180px auto; }
        .thumb { background-size: cover; background-position: center; }
        .body { padding: 1rem; display: grid; gap: .5rem; }
        .name { font-size: 1.1rem; }
        .desc { color: #666; font-size: .95rem; }
        .meta { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; justify-content: space-between; }
        .badge { background: #f5f3f0; border: 1px solid #e8e3dd; border-radius: 999px; padding: .25rem .6rem; font-size: .8rem; }
        .price { font-weight: 700; color: #ff6b6b; }
        .small { padding: .5rem .8rem; font-size: .85rem; }

        .pagination { margin-top: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 1rem; }
        .pagination button { padding: .5rem .9rem; border: 2px solid #e9ecef; border-radius: 8px; background: #fff; cursor: pointer; font-weight: 600; }
        .pagination button:disabled { opacity: .5; cursor: not-allowed; }
        .page-info { color: #666; }

        @media (max-width: 992px) { .shop-container { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  )
}
